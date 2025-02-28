from flask import Flask, request, jsonify
import boto3
import requests
import os
import tempfile
from flask_cors import CORS
from botocore.exceptions import ClientError
from ml.resume_scanner import extract_text_from_pdf, evaluate_resume
import urllib.parse

app = Flask(__name__)
CORS(app, resources={
    r"/scan_resume": {
        "origins": ["http://localhost:3000", "http://localhost:5000"],  # Updated port
        "methods": ["POST"],
        "allow_headers": ["Content-Type"]
    }
})

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
SAMPLE_RESUME_PATH = os.path.join(os.getcwd(), "sample_resume.pdf")

# Initialize S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION', 'us-east-1')
)

def download_from_s3(s3_url):
    try:
        # Parse S3 URL to get bucket and key
        parsed_url = urllib.parse.urlparse(s3_url)
        bucket_name = parsed_url.netloc.split('.')[0]
        key = parsed_url.path.lstrip('/')

        # Download to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            s3_client.download_fileobj(bucket_name, key, temp_file)
            return temp_file.name
    except ClientError as e:
        print(f"Error downloading from S3: {str(e)}")
        raise

@app.route('/scan_resume', methods=['POST'])
def scan_resume():
    try:
        if 'resumeUrl' not in request.form:
            return jsonify({"error": "No resume URL provided"}), 400
        
        pdf_url = request.form['resumeUrl']
        temp_file_path = None
        
        try:
            if 's3.amazonaws.com' in pdf_url:
                temp_file_path = download_from_s3(pdf_url)
            else:
                # Handle non-S3 URLs as before
                response = requests.get(pdf_url)
                if response.status_code != 200:
                    return jsonify({"error": "Failed to fetch resume file"}), 400
                
                temp_file_path = tempfile.mktemp(suffix='.pdf')
                with open(temp_file_path, 'wb') as f:
                    f.write(response.content)
            
            # Process the resume
            uploaded_text = extract_text_from_pdf(temp_file_path)
            sample_text = extract_text_from_pdf(SAMPLE_RESUME_PATH)
            category_scores, overall_score = evaluate_resume(uploaded_text, sample_text)
            
            return jsonify({
                "categoryScores": category_scores,
                "overallScore": overall_score
            })
            
        finally:
            # Clean up temp file
            if temp_file_path and os.path.exists(temp_file_path):
                os.unlink(temp_file_path)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)  # Changed port to 5000
