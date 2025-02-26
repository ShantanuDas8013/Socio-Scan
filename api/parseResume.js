const express = require("express");
const axios = require("axios");
const pdfParse = require("pdf-parse");

const router = express.Router();

router.post("/", async (req, res) => {
  const { resumeURL } = req.body;
  if (!resumeURL) {
    return res.status(400).json({ error: "Missing resume URL" });
  }
  try {
    // Fetch PDF file as buffer
    const response = await axios.get(resumeURL, {
      responseType: "arraybuffer",
    });
    const data = await pdfParse(response.data);

    // Dummy analysis: score based on word count; replace with your custom logic.
    const wordCount = data.text.split(/\s+/).length;
    const score = Math.min(100, Math.floor((wordCount / 500) * 100)); // example logic
    const feedback =
      wordCount < 500
        ? "The resume seems brief. Consider adding more details."
        : "The resume has sufficient content.";

    res.json({ score, feedback });
  } catch (error) {
    console.error("Resume parsing error:", error);
    res.status(500).json({ error: "Failed to parse resume" });
  }
});

module.exports = router;
