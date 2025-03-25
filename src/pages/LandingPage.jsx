import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import "./LandingPage.css"; // Verify this file exists in the same directory
import logo from "../assets/logo.png"; // Verify logo exists in assets directory
import SimpleNavbar from "../components/SimpleNavbar";

function ParticleBackground() {
  const createParticle = useCallback(() => {
    const particle = document.createElement("div");
    particle.classList.add("particle");
    const size = Math.random() * 15 + 5;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = "100%";
    particle.style.opacity = Math.random();
    return particle;
  }, []);

  useEffect(() => {
    const background = document.querySelector(".particles");
    let particles = [];

    const spawnParticle = () => {
      if (background) {
        const particle = createParticle();
        background.appendChild(particle);
        particles.push(particle);

        setTimeout(() => {
          particle.remove();
          particles = particles.filter((p) => p !== particle);
        }, 15000);
      }
    };

    const intervalId = setInterval(spawnParticle, 300);

    return () => {
      clearInterval(intervalId);
      particles.forEach((particle) => particle.remove());
    };
  }, [createParticle]);

  return <div className="particles" />;
}

function LandingPage() {
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Add small delay to ensure animation triggers
    setTimeout(() => setAnimate(true), 100);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white transition-colors relative overflow-hidden">
      <div className="animated-background">
        <ParticleBackground />
      </div>
      <SimpleNavbar />
      <main className="container mx-auto px-4 py-8 relative z-10">
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
            Sign In
          </Button>

          <Button
            variant="default"
            size="lg"
            className={`animated-button recruiter-btn ${
              animate ? "animate" : ""
            }`}
            onClick={() => navigate("/applicant-signup")}
          >
            Sign Up
          </Button>

          {/* <Button
            variant="default"
            size="lg"
            className={`animated-button admin-btn ${animate ? "animate" : ""}`}
            onClick={() => navigate("/admin")}
          >
            Are you Admin?
          </Button> */}
        </div>
      </main>
    </div>
  );
}

export default LandingPage;
