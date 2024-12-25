import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FeatureSection from "./components/FeatureSection";
import Workflow from "./components/Workflow";
import Footer from "./components/Footer";
import Pricing from "./components/Pricing";
import Testimonials from "./components/Testimonials";
import ProfilePage from "./pages/ProfilePage";
import LandingPage from "./pages/LandingPage";
import SettingsPage from "./pages/SettingsPage";
import ApplicantLogin from "./pages/ApplicantLogin";
import ApplicantSignup from "./pages/ApplicantSignup";
import { ThemeProvider } from "./context/ThemeContext";

const Home = () => {
  return (
    <>
      <HeroSection />
      <FeatureSection />
      <Workflow />
      <Pricing />
      <Testimonials />
      <Footer />
    </>
  );
};

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto pt-20 px-6">{children}</div>
    </>
  );
};

const AppContent = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white transition-colors">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/home"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/profile"
          element={
            <Layout>
              <ProfilePage />
            </Layout>
          }
        />
        <Route
          path="/settings"
          element={
            <Layout>
              <SettingsPage />
            </Layout>
          }
        />
        <Route path="/applicant-login" element={<ApplicantLogin />} />
        <Route path="/applicant-signup" element={<ApplicantSignup />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
};
export default App;
