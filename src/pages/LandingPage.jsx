import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import "./LandingPage.css"; // Verify this file exists in the same directory
import logo from "../assets/logo.png"; // Verify logo exists in assets directory
import SimpleNavbar from "../components/SimpleNavbar";

function LandingPage() {
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Add small delay to ensure animation triggers
    setTimeout(() => setAnimate(true), 100);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white transition-colors">
      <SimpleNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="landing-container">
          <div className={`logo-container ${animate ? "animate" : ""}`}>
            <img src={logo} alt="Virtual Recruiter Logo" className="logo" />
          </div>

          <Button
            variant="default"
            size="lg"
            className={`animated-button applicant-btn ${
              animate ? "animate" : ""
            }`}
            onClick={() => navigate("/applicant-login")}
          >
            Are you an Applicant?
          </Button>

          <Button
            variant="default"
            size="lg"
            className={`animated-button recruiter-btn ${
              animate ? "animate" : ""
            }`}
            onClick={() => navigate("/recruiter")}
          >
            Are you a Recruiter?
          </Button>

          <Button
            variant="default"
            size="lg"
            className={`animated-button admin-btn ${animate ? "animate" : ""}`}
            onClick={() => navigate("/admin")}
          >
            Are you Admin?
          </Button>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;
