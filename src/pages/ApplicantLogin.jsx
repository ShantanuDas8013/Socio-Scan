import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Eye, EyeOff } from "lucide-react";
import SimpleNavbar from "../components/SimpleNavbar";
import { auth } from "../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const ApplicantLogin = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;
      if (user) {
        navigate("/home");
      }
    } catch (error) {
      let errorMessage = "Failed to login. Please try again.";
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address.";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled.";
          break;
      }
      setErrors((prev) => ({
        ...prev,
        general: errorMessage,
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors">
      <SimpleNavbar />
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-gray-50 dark:bg-neutral-900 px-8">
        <div className="relative p-[3px] rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 via-pink-500 via-red-500 to-yellow-500 animate-border-glow">
          <div className="p-8 px-16 rounded-lg w-full max-w-4xl bg-white dark:bg-neutral-800 transition-colors">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
              Welcome Back
            </h2>
            <p className="text-xl mb-8 text-center text-gray-600 dark:text-gray-300">
              Please enter your details to sign in
            </p>
            <form
              onSubmit={handleSubmit}
              className="space-y-6 max-w-3xl mx-auto"
            >
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
                    placeholder-gray-500 dark:placeholder-gray-400
                    ${errors.email ? "border-red-500" : ""}`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-2">{errors.email}</p>
                )}
              </div>

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
                      placeholder-gray-500 dark:placeholder-gray-400
                      ${errors.password ? "border-red-500" : ""}`}
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
                {errors.password && (
                  <p className="text-red-500 text-sm mt-2">{errors.password}</p>
                )}
              </div>

              {errors.general && (
                <p className="text-red-500 text-sm text-center">
                  {errors.general}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r from-orange-500 to-orange-800 
                  text-white py-3 px-4 rounded-md transition-all text-lg font-medium
                  ${
                    loading
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:opacity-90"
                  }`}
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>
            <div className="mt-8 text-center text-base">
              <span className="text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
              </span>
              <button
                onClick={() => navigate("/applicant-signup")}
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantLogin;
