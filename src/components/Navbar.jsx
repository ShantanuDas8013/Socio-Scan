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
import { useNavigate, useLocation } from "react-router-dom"; // Add this import
import { getDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import logo from "../assets/logo.png";
import { useTheme } from "../context/ThemeContext";
import { onAuthStateChanged, signOut } from "firebase/auth"; // Add this import

// Remove the navItems import and add this constant:
const navItems = [
  { label: "Home", href: "/Home" },
  { label: "Profile", href: "/profile" },
  { label: "Settings", href: "/settings" },
];

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

  return (
    <div
      ref={dropdownRef}
      className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-lg backdrop-blur-lg
        transform transition-all duration-300 ease-out ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }
        ${
          theme === "dark"
            ? "bg-neutral-900/90 border border-neutral-700/50"
            : "bg-white/90 border border-neutral-200/50"
        }`}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <img
              src={
                userData?.photoURL ||
                `https://ui-avatars.com/api/?name=${
                  userData?.displayName || "User"
                }&background=random`
              }
              alt="Profile"
              className="w-16 h-16 rounded-xl border-2 border-orange-500 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3"
            />
            <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-neutral-900"></div>
          </div>
          <div className="flex-1">
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
              <div className="space-y-1">
                <p className="text-base font-semibold">
                  {userData.displayName ||
                    userData.fullName ||
                    userData.email.split("@")[0]}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {userData.email}
                </p>
              </div>
            ) : (
              <p className="text-sm">Please sign in</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 space-y-1">
        {[
          { icon: Home, label: "Home", path: "/Home" }, // Updated path to match Home.jsx
          { icon: User, label: "Your Profile", path: "/profile" },
          { icon: Settings, label: "Settings", path: "/settings" },
          { icon: HelpCircle, label: "Help & Support", path: "#" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => {
              navigate(item.path);
              onClose();
            }}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200
              ${
                theme === "dark"
                  ? "hover:bg-neutral-800/50 hover:shadow-inner"
                  : "hover:bg-gray-100/50 hover:shadow-inner"
              }
              group`}
          >
            <item.icon className="w-5 h-5 mr-3 text-orange-500 transition-transform duration-200 group-hover:scale-110" />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}

        <div className="my-2 border-t border-neutral-200 dark:border-neutral-700/50"></div>

        <button
          onClick={handleSignOut}
          className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200
            ${theme === "dark" ? "hover:bg-red-900/20" : "hover:bg-red-50"}
            text-red-500 group`}
        >
          <LogOut className="w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110" />
          <span className="text-sm font-medium">Sign Out</span>
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
  const location = useLocation();
  const { userData } = useUser(); // Add this line

  const handleNavigation = (item) => {
    // Close any open menus
    setProfileDropdownOpen(false);
    setMobileDrawerOpen(false);

    // Special case for pricing
    if (item.href === "/pricing") {
      navigate("/settings", { state: { openSubscription: true } });
      return;
    }

    // Handle section navigation
    const handleSectionNavigation = (sectionId) => {
      if (location.pathname !== "/Home") {
        // If not on home page, navigate to home with scroll target
        navigate("/Home", { state: { scrollTarget: sectionId } });
      } else {
        // If already on home page, just scroll to the section
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };

    // Route handling based on href
    switch (item.href) {
      case "/features":
        handleSectionNavigation("features-section");
        return;
      case "/workflow":
        handleSectionNavigation("workflow-section");
        return;
      case "/testimonials":
        handleSectionNavigation("testimonials-section");
        return;
      case "/":
        navigate("/Home");
        return;
      default:
        navigate(item.href);
    }
  };

  // Replace the existing scroll effects with this single, simplified effect
  useEffect(() => {
    if (location.pathname === "/" && location.state?.scrollTarget) {
      const scrollToTarget = () => {
        const element = document.getElementById(location.state.scrollTarget);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          // Clear the state after scrolling
          navigate("/", { replace: true, state: {} });
        }
      };

      // Try scrolling after a short delay to ensure content is rendered
      setTimeout(scrollToTarget, 100);
    }
  }, [location, navigate]);

  // Add useEffect to handle route changes
  useEffect(() => {
    setProfileDropdownOpen(false);
    setMobileDrawerOpen(false);
  }, [navigate]);

  // Add useEffect to handle clicks outside navbar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".navbar-container")) {
        setProfileDropdownOpen(false);
        setMobileDrawerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleNavbar = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
    setProfileDropdownOpen(false); // Close profile dropdown when mobile menu opens
  };

  const toggleProfileDropdown = (event) => {
    event.stopPropagation();
    setProfileDropdownOpen(!profileDropdownOpen);
    setMobileDrawerOpen(false);
  };

  // This new useEffect will handle closing the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownOpen &&
        !event.target.closest(".profile-dropdown-button") &&
        !event.target.closest(".profile-dropdown-content")
      ) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileDropdownOpen]);

  return (
    <nav
      className={`sticky top-0 z-50 backdrop-blur-xl border-b navbar-container
      ${
        theme === "dark"
          ? "bg-neutral-900/75 border-neutral-700/50"
          : "bg-white/75 border-neutral-200/50"
      }`}
    >
      <div className="container px-6 mx-auto relative">
        <div className="flex justify-between items-center h-16">
          {/* Logo section */}
          <div className="flex items-center space-x-3 group">
            <img
              className="h-10 w-10 transition-transform duration-300 group-hover:rotate-12"
              src={logo}
              alt="Logo"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-800 bg-clip-text text-transparent">
              Socio-Scan
            </span>
          </div>

          {/* Navigation items */}
          <ul className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <button
                  onClick={() => handleNavigation(item)}
                  className="relative py-5 px-3 transition-colors duration-200 hover:text-orange-500 group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 transition-transform duration-200 group-hover:scale-x-100"></span>
                </button>
              </li>
            ))}
          </ul>

          {/* Right section */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${
                theme === "dark"
                  ? "hover:bg-neutral-800/50"
                  : "hover:bg-gray-100/50"
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
                theme === "dark"
                  ? "hover:bg-neutral-800/50"
                  : "hover:bg-gray-100/50"
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
                className={`flex items-center space-x-3 rounded-xl p-2 transition-all duration-200
                  ${
                    theme === "dark"
                      ? "hover:bg-neutral-800/50"
                      : "hover:bg-gray-100/50"
                  }
                  ${profileDropdownOpen ? "ring-2 ring-orange-500" : ""}`}
              >
                <div className="relative">
                  <img
                    src={
                      userData?.photoURL ||
                      `https://ui-avatars.com/api/?name=${
                        userData?.displayName || "User"
                      }&background=random`
                    }
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-orange-500 transition-transform duration-200 hover:scale-105"
                  />
                  <div className="absolute bottom-0 right-0 bg-green-500 w-2 h-2 rounded-full border-2 border-white dark:border-neutral-900"></div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 
                  ${profileDropdownOpen ? "rotate-180" : "rotate-0"}`}
                />
              </button>
              <div className="profile-dropdown-content">
                <ProfileDropdown
                  isOpen={profileDropdownOpen}
                  onClose={() => setProfileDropdownOpen(false)}
                />
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleNavbar}
            className="lg:hidden p-2 rounded-xl transition-colors
              ${theme === 'dark' ? 'hover:bg-neutral-800/50' : 'hover:bg-gray-100/50'}"
          >
            {mobileDrawerOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile menu with updated styles... */}
      </div>
    </nav>
  );
};

export default Navbar;
