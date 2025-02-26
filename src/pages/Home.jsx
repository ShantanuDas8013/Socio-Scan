import { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Workflow, Testimonials } from "../components/index.jsx";

const Home = () => {
  const workflowRef = useRef(null);
  const testimonialsRef = useRef(null);

  return (
    <div className="min-h-screen">
      <section id="workflow-section" ref={workflowRef}>
        <Workflow />
      </section>

      <section id="testimonials-section" ref={testimonialsRef}>
        <Testimonials />
      </section>
    </div>
  );
};

export default Home;
