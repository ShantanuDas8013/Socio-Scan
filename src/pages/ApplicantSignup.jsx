import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import SimpleNavbar from "../components/SimpleNavbar";
import { auth, db } from "../firebase/firebase"; // Fixed import path
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import spaceVideo from "../assets/space2.mp4"; // Add this import

const ApplicantSignup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "", // Changed from name to fullName
    email: "",
    password: "",
    confirmPassword: "",
    phone: "", // Added phone field
  });
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageData, setImageData] = useState(null);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) {
        // 500KB limit
        setError("Image size should be less than 500KB");
        return;
      }
      try {
        const base64 = await convertToBase64(file);
        setImagePreview(base64);
        setImageData(base64);
      } catch (error) {
        console.error("Error converting image:", error);
        setError("Failed to process image");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Store additional user data in Firestore with correct field names
      await setDoc(doc(db, "users", userCredential.user.uid), {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || "",
        uid: userCredential.user.uid,
        photoURL: imageData, // Add the base64 image data
        createdAt: new Date().toISOString(),
      });

      navigate("/profile");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen relative">
      {/* Video background with darker overlay */}
      <div className="fixed inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src={spaceVideo} type="video/mp4" />
        </video>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <SimpleNavbar />
        <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-8">
          <div className="relative p-[2px] rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 via-pink-500 via-red-500 to-yellow-500 animate-border-glow">
            <div className="p-8 px-16 rounded-lg w-full max-w-4xl bg-white dark:bg-neutral-800 transition-colors">
              <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
                Create an Account
              </h2>
              <form
                onSubmit={handleSubmit}
                className="space-y-6 max-w-3xl mx-auto"
              >
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group">
                    <img
                      src={
                        imagePreview ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          formData.fullName || "User"
                        )}&background=random`
                      }
                      alt="Profile"
                      className="w-24 h-24 rounded-full border-2 border-orange-500 object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <label className="cursor-pointer p-2 text-white text-sm text-center">
                        Add Photo
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                  {error && error.includes("Image") && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                  )}
                </div>

                <div>
                  <label className="block text-base font-medium mb-2 text-gray-700 dark:text-gray-200">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName" // Changed from name to fullName
                    value={formData.fullName} // Changed from name to fullName
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-base border rounded-md transition-colors
                      bg-white dark:bg-neutral-700 
                      border-gray-300 dark:border-neutral-600 
                      text-gray-900 dark:text-white 
                      placeholder-gray-500 dark:placeholder-gray-400`}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Add phone number field */}
                <div>
                  <label className="block text-base font-medium mb-2 text-gray-700 dark:text-gray-200">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-base border rounded-md transition-colors
                      bg-white dark:bg-neutral-700 
                      border-gray-300 dark:border-neutral-600 
                      text-gray-900 dark:text-white 
                      placeholder-gray-500 dark:placeholder-gray-400`}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-base font-medium mb-2 text-gray-700 dark:text-gray-200">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-base border rounded-md transition-colors
                      bg-white dark:bg-neutral-700 
                      border-gray-300 dark:border-neutral-600 
                      text-gray-900 dark:text-white 
                      placeholder-gray-500 dark:placeholder-gray-400`}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-medium mb-2 text-gray-700 dark:text-gray-200">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 text-base border rounded-md transition-colors
                          bg-white dark:bg-neutral-700 
                          border-gray-300 dark:border-neutral-600 
                          text-gray-900 dark:text-white 
                          placeholder-gray-500 dark:placeholder-gray-400`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md transition-colors
                          hover:bg-gray-100 dark:hover:bg-neutral-600
                          text-gray-600 dark:text-gray-300"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-base font-medium mb-2 text-gray-700 dark:text-gray-200">
                      Confirm Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 text-base border rounded-md transition-colors
                        bg-white dark:bg-neutral-700 
                        border-gray-300 dark:border-neutral-600 
                        text-gray-900 dark:text-white 
                        placeholder-gray-500 dark:placeholder-gray-400`}
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 mt-6 text-lg font-medium bg-gradient-to-r from-orange-500 to-orange-800 text-white rounded-md hover:opacity-90 transition-opacity"
                >
                  Register
                </button>
                {error && (
                  <p className="text-red-500 text-sm mt-2 text-center">
                    {error}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantSignup;
