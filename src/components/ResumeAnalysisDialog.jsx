import React from "react";
import Modal from "react-modal";

// Optional: Set the app element for accessibility (only once in your app)
Modal.setAppElement("#root");

const ResumeAnalysisDialog = ({ isOpen, onClose, result, loading }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Resume Analysis"
    >
      <h2>Resume Analysis Report</h2>
      {loading && <p>Analyzing...</p>}
      {!loading && result && (
        <div>
          <p>
            Professionalism Score:{" "}
            <strong>{result.professionalismScore}%</strong>
          </p>
          <p>
            <strong>Education:</strong>{" "}
            {result.education ? "✔️ Present" : "❌ Missing"}
          </p>
          <p>
            <strong>Projects:</strong>{" "}
            {result.projects ? "✔️ Present" : "❌ Missing"}
          </p>
          <p>
            <strong>Work Experience:</strong>{" "}
            {result.workExperience ? "✔️ Present" : "❌ Missing"}
          </p>
          <p>
            <strong>Skills:</strong>{" "}
            {result.skills ? "✔️ Present" : "❌ Missing"}
          </p>
          <p>
            <strong>Achievements:</strong>{" "}
            {result.achievements ? "✔️ Present" : "❌ Missing"}
          </p>
        </div>
      )}
      <button onClick={onClose}>Close</button>
    </Modal>
  );
};

export default ResumeAnalysisDialog;
