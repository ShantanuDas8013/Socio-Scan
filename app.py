import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv
import os
from flask import Flask, request, jsonify

app = Flask(__name__)

# ...existing code...

# Initialize S3 client
load_dotenv()
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION')
)

def download_resume_from_s3(s3_url):
    try:
        # Parse bucket and key from S3 URL
        bucket = 'socio-scan1'
        key = s3_url.split('amazonaws.com/')[1]
        
        # Download file to temporary location
        temp_file = '/tmp/resume.pdf'
        s3_client.download_file(bucket, key, temp_file)
        return temp_file
    except ClientError as e:
        if e.response['Error']['Code'] == '403':
            raise Exception("Access denied. Please check AWS credentials.")
        raise Exception(f"Failed to download resume: {str(e)}")

@app.route('/scan-resume', methods=['POST'])
def scan_resume():
    try:
        data = request.get_json()
        resume_url = data.get('resume_url')
        
        if not resume_url:
            return jsonify({'error': 'No resume URL provided'}), 400
            
        temp_file = download_resume_from_s3(resume_url)
        # ...existing code for processing resume...

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ...existing code...
