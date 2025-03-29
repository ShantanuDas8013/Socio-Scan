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

# AWS S3 Configuration

```
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_s3_bucket_name

# Firebase Configuration

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# EmailJS Configuration

VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_USER_ID=your_emailjs_user_id
```

## 👨‍💻 AWS S3 Setup

For file storage functionality, you need to create an AWS IAM user with the following policy:

```bash
{
"Version": "2012-10-17",
"Statement": [
{
"Effect": "Allow",
"Action": [
"s3:PutObject",
"s3:PutObjectAcl",
"s3:GetObject",
"s3:DeleteObject"
],
"Resource": "arn:aws:s3:::socio-scan1/\*"
}
]
}
```

## 📚 Usage

1. **Sign Up/Login**: Create an account or login with your credentials

2. **Profile Setup**: Complete your profile and upload your resume

3. **Resume Analysis**: Analyze your resume to get instant feedback

4. **Implement Changes**: Make changes based on recommendations

5. **Subscription Management**: Upgrade your subscription for additional features

## 📖 API Documentation

The resume analysis API endpoint is available at:

```bash
POST /api/parseResume
```

Request body:

```bash
{
  "resumeURL": "https://your-s3-bucket.com/path-to-resume.pdf"
}
```

Response format:

```bash
{
  "overallScore": 85,
  "categoryScores": {
    "Education": 90,
    "Work Experience": 80,
    "Technical Skills": 75,
    "Projects": 85,
    "Achievements": 60
  }
}
```

## 🤝 Contributing

1. Fork the repository

2. Create your feature branch: git checkout -b feature/amazing-feature

3. Commit your changes: git commit -m 'Add some amazing feature'

4. Push to the branch: git push origin feature/amazing-feature

5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgments

1. Tailwind CSS for the styling

2. Firebase for authentication and database

3. AWS for file storage

4. Vite for the build tool

<p align="center"> Made with ❤️ by Shantanu Das </p>
