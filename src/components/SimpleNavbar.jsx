import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import logo from "../assets/logo.png";

const SimpleNavbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 py-3 backdrop-blur-md bg-white/30 dark:bg-neutral-900/30 border-b border-neutral-200/50 dark:border-neutral-700/50">
      <div className="container px-4 mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center flex-shrink-0">
            <img className="h-10 w-10 mr-2" src={logo} alt="Logo" />
            <span
              className="text-xl tracking-tight"
              style={{ color: "var(--text-color)" }}
            >
              Socio-Scan
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun
                className="w-5 h-5"
                style={{ stroke: "var(--icon-color)" }}
              />
            ) : (
              <Moon
                className="w-5 h-5"
                style={{ stroke: "var(--icon-color)" }}
              />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default SimpleNavbar;
