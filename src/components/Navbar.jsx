import { useUser } from "../hooks/useUser"; // Add this import
import {
  Menu,
  X,
  Settings,
  User,
  LogOut,
  HelpCircle,
  Bell,
  ChevronDown,
  Home,
  Sun,
  Moon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import logo from "../assets/logo.png";
import { navItems } from "../constants";
import { useTheme } from "../context/ThemeContext";
import { onAuthStateChanged, signOut } from "firebase/auth"; // Add this import

const ProfileDropdown = ({ isOpen, onClose }) => {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { userData, loading, error } = useUser(); // Use the custom hook

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/applicant-login");
      onClose();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Add debug logging
  useEffect(() => {
    if (userData) {
      console.log("ProfileDropdown - Current user data:", userData);
    }
  }, [userData]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg border py-2 ${
        theme === "dark"
          ? "bg-neutral-900 border-neutral-700 text-white"
          : "bg-white border-neutral-200 text-neutral-900"
      }`}
    >
      <div
        className={`px-4 py-3 border-b ${
          theme === "dark" ? "border-neutral-700" : "border-neutral-200"
        }`}
      >
        <div className="flex items-center">
          <img
            src={
              userData?.photoURL ||
              `https://ui-avatars.com/api/?name=${
                userData?.displayName || "User"
              }&background=random`
            }
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-orange-500"
          />
          <div className="ml-3">
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ) : error ? (
              <div className="text-sm text-red-500">
                <p>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  Retry
                </button>
              </div>
            ) : userData ? (
              <>
                <p className="text-sm font-medium">
                  {userData.displayName ||
                    userData.fullName ||
                    userData.email.split("@")[0]}
                </p>
                <p className="text-xs text-gray-400">{userData.email}</p>
              </>
            ) : (
              <p className="text-sm">Please sign in</p>
            )}
          </div>
        </div>
      </div>

      {/* Rest of the dropdown menu remains the same */}
      <div className="py-2">
        <button
          onClick={() => {
            navigate("/home"); // Changed from '/app' to '/home' to match the route in App.jsx
            onClose();
          }}
          className={`w-full flex items-center px-4 py-2 transition-colors ${
            theme === "dark" ? "hover:bg-neutral-800" : "hover:bg-gray-100"
          }`}
        >
          <Home className="w-4 h-4 mr-3" />
          <span className="text-sm">Home</span>
        </button>
        <button
          onClick={() => {
            navigate("/profile");
            onClose();
          }}
          className={`w-full flex items-center px-4 py-2 transition-colors ${
            theme === "dark" ? "hover:bg-neutral-800" : "hover:bg-gray-100"
          }`}
        >
          <User className="w-4 h-4 mr-3" />
          <span className="text-sm">Your Profile</span>
        </button>
        <button
          onClick={() => {
            navigate("/settings");
            onClose();
          }}
          className={`w-full flex items-center px-4 py-2 transition-colors ${
            theme === "dark" ? "hover:bg-neutral-800" : "hover:bg-gray-100"
          }`}
        >
          <Settings className="w-4 h-4 mr-3" />
          <span className="text-sm">Settings</span>
        </button>
        <a
          href="#"
          className={`flex items-center px-4 py-2 transition-colors ${
            theme === "dark" ? "hover:bg-neutral-800" : "hover:bg-gray-100"
          }`}
        >
          <HelpCircle className="w-4 h-4 mr-3" />
          <span className="text-sm">Help & Support</span>
        </a>
        <div
          className={`border-t my-2 ${
            theme === "dark" ? "border-neutral-700" : "border-neutral-200"
          }`}
        ></div>
        <button
          onClick={handleSignOut}
          className={`w-full flex items-center px-4 py-2 text-red-500 transition-colors ${
            theme === "dark" ? "hover:bg-neutral-800" : "hover:bg-gray-100"
          }`}
        >
          <LogOut className="w-4 h-4 mr-3" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { userData } = useUser(); // Add this line

  const toggleNavbar = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  return (
    <nav
      className={`sticky top-0 z-50 py-3 backdrop-blur-lg border-b ${
        theme === "dark" ? "border-neutral-700/80" : "border-neutral-200/80"
      }`}
    >
      <div className="container px-4 mx-auto relative lg:text-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center flex-shrink-0">
            <img className="h-10 w-10 mr-2" src={logo} alt="Logo" />
            <span className="text-xl tracking-tight">Socio-Scan</span>
          </div>

          <ul className="hidden lg:flex ml-14 space-x-12">
            {navItems.map((item, index) => (
              <li key={index}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>

          <div className="hidden lg:flex items-center space-x-6">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${
                theme === "dark" ? "hover:bg-neutral-800" : "hover:bg-gray-100"
              }`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Notifications */}
            <button
              className={`p-2 rounded-full relative transition-colors ${
                theme === "dark" ? "hover:bg-neutral-800" : "hover:bg-gray-100"
              }`}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-orange-500 text-xs rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </button>

            {/* Profile Section */}
            <div className="relative">
              <button
                onClick={toggleProfileDropdown}
                className={`flex items-center space-x-2 rounded-lg p-2 transition-colors ${
                  theme === "dark"
                    ? "hover:bg-neutral-800"
                    : "hover:bg-gray-100"
                }`}
              >
                <img
                  src={
                    userData?.photoURL ||
                    `https://ui-avatars.com/api/?name=${
                      userData?.displayName || "User"
                    }&background=random`
                  }
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-orange-500"
                />
                <ChevronDown className="w-4 h-4" />
              </button>
              <ProfileDropdown
                isOpen={profileDropdownOpen}
                onClose={() => setProfileDropdownOpen(false)}
              />
            </div>

            <a
              href="#"
              className="bg-gradient-to-r from-orange-500 to-orange-800 py-2 px-3 rounded-md"
            >
              Upgrade Pro
            </a>
          </div>

          <div className="lg:hidden md:flex flex-col justify-end">
            <button onClick={toggleNavbar}>
              {mobileDrawerOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileDrawerOpen && (
          <div
            className={`fixed right-0 top-16 z-20 w-full p-12 flex flex-col justify-center items-center lg:hidden ${
              theme === "dark"
                ? "bg-neutral-900 text-white"
                : "bg-white text-neutral-900"
            }`}
          >
            <ul className="mb-8">
              {navItems.map((item, index) => (
                <li key={index} className="py-4">
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
            <div className="flex flex-col space-y-4 w-full items-center">
              <div className="flex items-center justify-center space-x-4">
                {/* Theme Toggle for Mobile */}
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-full transition-colors ${
                    theme === "dark"
                      ? "hover:bg-neutral-800"
                      : "hover:bg-gray-100"
                  }`}
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
                <button
                  className={`p-2 rounded-full relative transition-colors ${
                    theme === "dark"
                      ? "hover:bg-neutral-800"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    3
                  </span>
                </button>
                <button
                  onClick={toggleProfileDropdown}
                  className={`flex items-center space-x-2 rounded-lg p-2 transition-colors ${
                    theme === "dark"
                      ? "hover:bg-neutral-800"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <img
                    src="/api/placeholder/32/32"
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-orange-500"
                  />
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <a
                href="#"
                className="w-full text-center py-2 px-3 rounded-md bg-gradient-to-r from-orange-500 to-orange-800"
              >
                Upgrade Pro
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
