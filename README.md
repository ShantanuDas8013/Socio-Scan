# Socio-Scan

<p align="center">
  <img src="src/assets/logo.png" alt="Socio-Scan Logo" width="200"/>
</p>

<p align="center">
  <strong>Fast, Ethical Resume Screening for Hiring Decisions</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#installation">Installation</a> •
  <a href="#environment-setup">Environment Setup</a> •
  <a href="#usage">Usage</a> •
  <a href="#api-documentation">API Documentation</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

## 📋 Overview

Socio-Scan is an intelligent application that helps job applicants analyze their resumes and improve their chances of getting hired. The platform uses advanced algorithms to evaluate resumes, providing actionable insights and recommendations to enhance professional profiles.

## ✨ Features

- **Resume Analysis**: Upload and scan your resume for comprehensive feedback
- **Professional Scoring**: Get detailed scores on various resume components
- **Improvement Recommendations**: Receive actionable advice to enhance your resume
- **User Profiles**: Create and manage your professional profile
- **Secure Document Storage**: Safely store your resume with AWS S3 integration
- **Subscription Plans**: Multiple service tiers to suit different needs

## 🎬 Demo

![Demo Screenshot](path/to/screenshot.png)

[View the Live Demo](https://your-demo-url.com) (Replace with your actual demo link)

## 🛠️ Tech Stack

- **Frontend**:

  - React (with Vite)
  - Tailwind CSS
  - React Router
  - Context API for state management

- **Backend**:

  - Firebase Authentication
  - Firestore Database
  - AWS S3 for file storage
  - Express.js for API endpoints

- **Libraries**:
  - PDF Parse for resume extraction
  - EmailJS for contact form
  - React Modal for dialogs
  - Lucide React for icons

## 📦 Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/Socio-Scan.git
cd Socio-Scan
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables (see Environment Setup section)

4. Run the development server:

```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## 🔧 Environment Setup

Create a `.env` file in the root directory with the following variables:
