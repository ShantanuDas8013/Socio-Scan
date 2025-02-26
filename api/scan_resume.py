from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
from ml.resume_scanner import extract_text_from_pdf, evaluate_resume
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Change this path to your sample resume pdf file
SAMPLE_RESUME_PATH = os.path.join(os.getcwd(), "sample_resume.pdf")

@app.route('/scan_resume', methods=['POST'])
def scan_resume():
    if 'resumeUrl' in request.form:
        pdf_url = request.form['resumeUrl']
        response = requests.get(pdf_url)
        print("Fetching from URL:", pdf_url, "Status:", response.status_code)  # Debug log
        if response.status_code != 200:
            return jsonify({"error": "Could not fetch file from URL"}), 400
        filename = os.path.basename(pdf_url)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        with open(file_path, "wb") as f:
            f.write(response.content)
    elif 'resume' in request.files:  # legacy case if a file upload was sent
        file = request.files['resume']
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
    else:
        return jsonify({"error": "No resume data provided"}), 400

    uploaded_text = extract_text_from_pdf(file_path)
    sample_text = extract_text_from_pdf(SAMPLE_RESUME_PATH)
    
    category_scores, overall_score = evaluate_resume(uploaded_text, sample_text)
    return jsonify({
        "categoryScores": category_scores,
        "overallScore": overall_score
    })

if __name__ == '__main__':
    app.run(port=8000, debug=True)
