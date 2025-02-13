import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../hooks/useUser";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebase"; // Removed storage import since we won't use it now
import { toast } from "react-hot-toast";
import { getAuth, deleteUser } from "firebase/auth";
import { FaCloudUploadAlt } from "react-icons/fa"; // Import cloud upload icon
import { uploadFile, deleteFile } from "../aws/s3";
import { generateSignedUrl } from "../aws/generateSignedUrl";

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
  const [signedResumeUrl, setSignedResumeUrl] = useState(null);
  const fileInputRef = useRef(null);

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
    const updateSignedUrl = async () => {
      if (resumePreview && resumeFileName) {
        try {
          const url = await generateSignedUrl(resumePreview, resumeFileName);
          setSignedResumeUrl(url);
        } catch (error) {
          console.error("Error generating signed URL", error);
          setSignedResumeUrl(resumePreview);
        }
      }
    };
    updateSignedUrl();
  }, [resumePreview, resumeFileName]);

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

  // Updated resume handler: adds debugging logs to ensure PDF upload works
  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      if (file.size > 2000000) {
        toast.error("Resume size should be less than 2MB");
        return;
      }
      console.log("PDF file selected:", file);
      try {
        const s3Url = await uploadFile(file);
        console.log("Received S3 URL:", s3Url);
        setResumePreview(s3Url);
        setResumeUpload(s3Url); // Save S3 URL for Firestore update
        setResumeFileName(file.name); // Save the file name
      } catch (error) {
        console.error("Error uploading resume:", error);
        toast.error("Failed to upload resume");
      }
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  // Updated remove resume handler: also calls deleteFile to remove resume from S3
  const handleRemoveResume = async () => {
    if (window.confirm("Are you sure you want to remove your resume?")) {
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
        setResumeFileName(""); // Clear the saved file name
        toast.success("Resume removed successfully!");
      } catch (error) {
        console.error("Error removing resume:", error);
        toast.error("Failed to remove resume");
      }
    }
  };

  // Updated handleSubmit: logs the resumeUpload value before updating Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData || !userData.uid) {
      toast.error("User data not loaded");
      return;
    }
    console.log("Resume to update:", resumeUpload);
    try {
      const userRef = doc(db, "users", userData.uid);
      const resumeURL = resumeUpload ? resumeUpload : userData.resumeURL || "";

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
      setResumeUpload(null);
      setResumePreview(resumeURL);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    if (window.confirm("Do you want to cancel changes?")) {
      // Reset form data to original user data
      setUserDetails({
        fullName: userData?.fullName || userData?.displayName || "",
        email: userData?.email || "",
        age: userData?.age || "",
        phone: userData?.phone || "",
        bio: userData?.bio || "",
      });
      // Reset image states
      setImageUpload(null);
      setImagePreview(null);
      // Exit edit mode
      setIsEditing(false);
    }
  };

  // Add delete account handler
  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          // Delete from Firestore
          await deleteDoc(doc(db, "users", user.uid));

          // Delete from Firebase Auth
          await deleteUser(user);

          toast.success("Account deleted successfully");
          // The user will be automatically logged out and redirected
        }
      } catch (error) {
        console.error("Error deleting account:", error);
        toast.error(
          "Failed to delete account. Make sure to re-authenticate first."
        );
      }
    }
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
  const resumeViewUrl = resumePreview
    ? `${resumePreview}?response-content-disposition=${encodeURIComponent(
        `inline; filename="${resumeFileName}"`
      )}`
    : null;

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="ml-4 space-y-2">
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 dark:text-white text-neutral-900">
        Your Profile
      </h1>
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg shadow-lg transition-colors">
        <div className="flex items-center mb-4">
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
              className="w-20 h-20 rounded-full border-2 border-orange-500 object-cover"
            />
            {isEditing && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                <label className="cursor-pointer p-2 text-white text-sm text-center">
                  Change Photo
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
          <div className="ml-4">
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="fullName"
                  value={userDetails.fullName}
                  onChange={handleInputChange}
                  className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white p-2 rounded mb-2 w-full"
                  placeholder="Full Name"
                />
                <input
                  type="email"
                  name="email"
                  value={userDetails.email}
                  onChange={handleInputChange}
                  className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white p-2 rounded mb-2 w-full"
                  disabled
                />
                <input
                  type="text"
                  name="age"
                  value={userDetails.age}
                  onChange={handleInputChange}
                  className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white p-2 rounded mb-2 w-full transition-colors"
                  placeholder="Age"
                />
                <input
                  type="tel"
                  name="phone"
                  value={userDetails.phone}
                  onChange={handleInputChange}
                  className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white p-2 rounded mb-2 w-full transition-colors"
                  placeholder="Phone number"
                />
                <textarea
                  name="bio"
                  value={userDetails.bio}
                  onChange={handleInputChange}
                  className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white p-2 rounded mb-2 w-full transition-colors"
                  rows="3"
                />
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upload Resume (PDF)
                  </label>
                  <div
                    className="mt-1 flex items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    onClick={handleUploadClick}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    <FaCloudUploadAlt className="text-3xl text-gray-400 dark:text-gray-500" />
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleResumeChange}
                      className="hidden"
                      ref={fileInputRef}
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      {resumeFileName
                        ? resumeFileName
                        : "Drag & drop your resume here, or click to select a file"}
                    </span>
                  </div>
                  {resumePreview && (
                    <div className="mt-2 flex items-center">
                      <a
                        href={signedResumeUrl || resumePreview}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View Resume
                      </a>
                      <button
                        type="button"
                        onClick={handleRemoveResume}
                        className="ml-4 text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel} // Changed from setIsEditing(false) to handleCancel
                    className="bg-neutral-200 dark:bg-gray-600 text-neutral-900 dark:text-white px-4 py-2 rounded hover:bg-neutral-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className="text-xl font-medium dark:text-white text-neutral-900">
                  {userDetails.fullName}
                </p>
                <p className="text-sm dark:text-gray-400 text-gray-600">
                  {userDetails.email}
                </p>
                <p className="text-sm dark:text-gray-400 text-gray-600">
                  Age: {userDetails.age || "Not specified"}
                </p>
                <p className="text-sm dark:text-gray-400 text-gray-600">
                  Phone: {userDetails.phone || "Not specified"}
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-orange-500 text-white px-4 py-2 rounded mt-2 hover:bg-orange-600"
                >
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
        <div>
          <p className="text-sm mb-2 dark:text-white text-neutral-900">Bio:</p>
          <p className="text-gray-400">
            {userDetails.bio || "No bio added yet."}
          </p>
        </div>
        {/* Add Danger Zone section */}
        <div className="mt-8 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4 text-red-600 dark:text-red-400">
            Danger Zone
          </h3>
          <div className="space-y-4">
            <button
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md transition-colors"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
