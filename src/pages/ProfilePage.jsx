import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../hooks/useUser";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebase"; // Removed storage import since we won't use it now
import { toast } from "react-hot-toast";
import { getAuth, deleteUser } from "firebase/auth";
import { FaCloudUploadAlt } from "react-icons/fa"; // Import cloud upload icon
import { uploadFile, deleteFile, getPresignedUrl } from "../aws/s3";
import Dialog from "../components/Dialog";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { userData, loading } = useUser();
  const [userDetails, setUserDetails] = useState({
    fullName: "",
    email: "",
    age: "",
    phone: "",
    bio: "",
  });
  const [imageUpload, setImageUpload] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [resumeUpload, setResumeUpload] = useState(null);
  const [resumePreview, setResumePreview] = useState(null);
  const [resumeFileName, setResumeFileName] = useState("");
  const [presignedUrl, setPresignedUrl] = useState(null);
  const [resumeFile, setResumeFile] = useState(null); // Add state to store the file
  const fileInputRef = useRef(null);
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "default",
  });

  const bucketName = "socio-scan1"; // Replace with your S3 bucket name

  useEffect(() => {
    if (userData) {
      setUserDetails({
        fullName: userData.fullName || userData.displayName || "",
        email: userData.email || "",
        age: userData.age || "",
        phone: userData.phone || "",
        bio: userData.bio || "",
        resumeURL: userData.resumeURL || "",
      });
      setResumePreview(userData.resumeURL || null);
      // If a resumeURL is present but file name is not saved, extract it from the URL
      if (userData.resumeURL && !resumeFileName) {
        const extractedName = userData.resumeURL.split("/").pop();
        setResumeFileName(extractedName);
      }
    }
  }, [userData]);

  useEffect(() => {
    const generatePresignedUrl = async () => {
      if (resumePreview) {
        try {
          // Extract the key from the S3 URL
          const key = resumePreview.split(".com/").pop();
          const url = await getPresignedUrl(bucketName, key);
          setPresignedUrl(url);
        } catch (error) {
          console.error("Error getting presigned URL:", error);
          toast.error("Failed to generate secure access link for resume");
        }
      }
    };

    generatePresignedUrl();
  }, [resumePreview]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Update image handling
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) {
        // 500KB limit
        toast.error("Image size should be less than 500KB");
        return;
      }
      try {
        const base64 = await convertToBase64(file);
        setImagePreview(base64);
        setImageUpload(base64);
      } catch (error) {
        console.error("Error converting image:", error);
        toast.error("Failed to process image");
      }
    }
  };

  // Updated resume handler: only sets the file without uploading
  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      if (file.size > 2000000) {
        toast.error("Resume size should be less than 2MB");
        return;
      }
      console.log("PDF file selected:", file);
      setResumeFile(file); // Set the file to state
      setResumeFileName(file.name); // Save the file name
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  // Updated remove resume handler: also calls deleteFile to remove resume from S3
  const handleRemoveResume = () => {
    setDialog({
      isOpen: true,
      title: "Remove Resume",
      message:
        "Are you sure you want to remove your resume? This action cannot be undone.",
      onConfirm: async () => {
        try {
          if (resumePreview) {
            await deleteFile(resumePreview);
          }
          const userRef = doc(db, "users", userData.uid);
          await updateDoc(userRef, {
            resumeURL: "",
          });
          setResumeUpload(null);
          setResumePreview(null);
          setResumeFileName("");
          toast.success("Resume removed successfully!");
        } catch (error) {
          console.error("Error removing resume:", error);
          toast.error("Failed to remove resume");
        }
        setDialog({ ...dialog, isOpen: false });
      },
      type: "default",
    });
  };

  // Updated handleSubmit: uploads the file to S3 before updating Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData || !userData.uid) {
      toast.error("User data not loaded");
      return;
    }
    console.log("Resume to update:", resumeFile);
    try {
      let resumeURL = userData.resumeURL || "";
      if (resumeFile) {
        resumeURL = await uploadFile(resumeFile); // Upload the file to S3
        console.log("Received S3 URL:", resumeURL);
      }

      const userRef = doc(db, "users", userData.uid);
      const updateData = {
        fullName: userDetails.fullName,
        phone: userDetails.phone || "",
        age: userDetails.age || "",
        bio: userDetails.bio || "",
        photoURL: imageUpload || userData.photoURL,
        resumeURL, // S3 URL linked to the user document in Firestore
        updatedAt: new Date().toISOString(),
      };

      console.log("Updating user document with data:", updateData);
      await updateDoc(userRef, updateData);
      setUserDetails((prev) => ({
        ...prev,
        ...updateData,
      }));
      setIsEditing(false);
      setImageUpload(null);
      setImagePreview(null);
      setResumeFile(null); // Clear the file state
      setResumePreview(resumeURL);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setDialog({
      isOpen: true,
      title: "Discard Changes?",
      message:
        "Are you sure you want to discard your changes? This action cannot be undone.",
      onConfirm: () => {
        setUserDetails({
          fullName: userData?.fullName || userData?.displayName || "",
          email: userData?.email || "",
          age: userData?.age || "",
          phone: userData?.phone || "",
          bio: userData?.bio || "",
        });
        setImageUpload(null);
        setImagePreview(null);
        setIsEditing(false);
        setDialog({ ...dialog, isOpen: false });
      },
      type: "default",
    });
  };

  // Add delete account handler
  const handleDeleteAccount = () => {
    setDialog({
      isOpen: true,
      title: "Delete Account",
      message:
        "This action cannot be undone. All your data will be permanently deleted. Are you sure you want to proceed?",
      onConfirm: async () => {
        try {
          const auth = getAuth();
          const user = auth.currentUser;

          if (user) {
            await deleteDoc(doc(db, "users", user.uid));
            await deleteUser(user);
            toast.success("Account deleted successfully");
          }
        } catch (error) {
          console.error("Error deleting account:", error);
          toast.error(
            "Failed to delete account. Make sure to re-authenticate first."
          );
        }
        setDialog({ ...dialog, isOpen: false });
      },
      type: "danger",
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleResumeChange({ target: { files: [file] } });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Compute resume view URL with inline disposition if resumePreview exists
  const resumeViewUrl = presignedUrl || resumePreview;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-neutral-900 dark:to-neutral-800 p-4">
        <div className="animate-pulse max-w-4xl mx-auto">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="backdrop-blur-lg bg-white/70 dark:bg-neutral-800/70 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="ml-6 space-y-3">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-neutral-900 dark:to-neutral-800 p-4 transition-all duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
            Your Profile
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Manage your personal information and preferences
          </p>
        </div>

        <div className="backdrop-blur-lg bg-white/70 dark:bg-neutral-800/70 p-8 rounded-2xl shadow-xl transition-all duration-300">
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="flex-shrink-0">
              <div className="relative group">
                <img
                  src={
                    imagePreview ||
                    userData?.photoURL ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      userDetails.fullName
                    )}&background=random`
                  }
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-orange-500 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <label className="cursor-pointer p-3 text-white text-sm text-center hover:scale-110 transition-transform">
                      <span className="flex flex-col items-center gap-2">
                        <FaCloudUploadAlt className="text-2xl" />
                        Change Photo
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-grow">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={userDetails.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      />
                    </div>
                    {/* Similar styling for other input fields */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={userDetails.email}
                        disabled
                        className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-neutral-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={userDetails.bio}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Resume
                    </label>
                    <div
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all hover:border-orange-500 bg-white/30 dark:bg-neutral-800/30"
                      onClick={handleUploadClick}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    >
                      <FaCloudUploadAlt className="text-4xl mx-auto text-orange-500 mb-2" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {resumeFileName ||
                          "Drag & drop your resume here, or click to select"}
                      </p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="application/pdf"
                        onChange={handleResumeChange}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-1">
                      {userDetails.fullName}
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {userDetails.email}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Bio
                      </h3>
                      <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                        {userDetails.bio || "No bio added yet."}
                      </p>
                    </div>
                    {resumePreview && (
                      <div>
                        <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Resume
                        </h3>
                        <div className="mt-2 flex items-center gap-4">
                          <a
                            href={resumeViewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            View Resume
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 border-t border-neutral-200 dark:border-neutral-700 pt-8">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
                Danger Zone
              </h3>
              <button
                onClick={handleDeleteAccount}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors duration-300"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
      <Dialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        onConfirm={dialog.onConfirm}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
        type={dialog.type}
        confirmLabel={dialog.type === "danger" ? "Delete" : "Confirm"}
      />
    </div>
  );
};

export default ProfilePage;
