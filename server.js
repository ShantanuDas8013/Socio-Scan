const express = require("express");
const bodyParser = require("body-parser");
const parseResumeRouter = require("./api/parseResume");

const app = express();
app.use(bodyParser.json());

// Add resume parsing API endpoint
app.use("/api/parseResume", parseResumeRouter);

// ...existing middleware and routes...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
