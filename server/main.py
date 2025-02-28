from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import boto3
from botocore.exceptions import ClientError
from config import AWS_CONFIG
import PyPDF2
from io import BytesIO
import re
from urllib.parse import urlparse

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Configure AWS S3 client with config values
try:
    s3_client = boto3.client(
        's3',
        aws_access_key_id=AWS_CONFIG['aws_access_key_id'],
        aws_secret_access_key=AWS_CONFIG['aws_secret_access_key'],
        region_name=AWS_CONFIG['region_name']
    )
except Exception as e:
    print(f"Failed to initialize S3 client: {str(e)}")
    s3_client = None

def analyze_resume_content(text):
    # Initialize scores for each category
    scores = {
        "Education": 0,
        "Projects": 0,
        "Work Experience": 0,
        "Technical Skills": 0,
        "Achievements": 0
    }
    
    # Keywords and patterns for each category
    patterns = {
        "Education": r"education|university|college|degree|bachelor|master|phd",
        "Projects": r"project|developed|implemented|created|built",
        "Work Experience": r"experience|work|job|position|employment|company",
        "Technical Skills": r"skills|technologies|programming|software|technical",
        "Achievements": r"achievement|award|honor|certification|accomplishment"
    }
    
    # Calculate scores based on keyword matches
    for category, pattern in patterns.items():
        matches = len(re.findall(pattern, text.lower()))
        scores[category] = min(100, matches * 20)  # Scale score from 0-100
    
    # Calculate overall professionalism score
    overall_score = sum(scores.values()) / len(scores)
    
    return {
        "overallScore": overall_score,
        "categoryScores": scores
    }

class ResumeResponse(BaseModel):
    overallScore: float
    categoryScores: dict

@app.post("/scan_resume", response_model=ResumeResponse)
async def scan_resume(resumeUrl: str = Form(...)):
    try:
        print(f"Received request to scan resume: {resumeUrl}")
        if not resumeUrl:
            raise HTTPException(status_code=400, detail="Resume URL is required")
            
        parsed_url = urlparse(resumeUrl.strip())
        
        # Validate URL scheme
        if not parsed_url.scheme or not parsed_url.netloc:
            raise HTTPException(status_code=400, detail="Invalid URL format")
        
        # Extract bucket name and key from S3 URL
        try:
            if '.s3.' in parsed_url.netloc:
                # Virtual-hosted-style URL
                bucket_name = parsed_url.netloc.split('.s3.')[0]
                key = parsed_url.path.lstrip('/')
            else:
                # Path-style URL
                path_parts = parsed_url.path.lstrip('/').split('/', 1)
                if len(path_parts) < 2:
                    raise ValueError("Invalid path format")
                bucket_name = path_parts[0]
                key = path_parts[1]
                
            if not bucket_name or not key:
                raise ValueError("Missing bucket name or key")
                
            print(f"Parsed S3 URL - Bucket: {bucket_name}, Key: {key}")
            
        except Exception as e:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid S3 URL format: {str(e)}"
            )

        try:
            # Get the PDF file from S3
            response = s3_client.get_object(Bucket=bucket_name, Key=key)
            pdf_content = response['Body'].read()
            
            # Process PDF and analyze content
            pdf_file = BytesIO(pdf_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
            
            result = analyze_resume_content(text)
            print(f"Analysis complete: {result}")
            return result
                
        except ClientError as e:
            print(f"S3 error: {str(e)}")
            raise HTTPException(
                status_code=403,
                detail=f"Error accessing S3: {str(e)}"
            )
                
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Unexpected error in scan_resume: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )

@app.get("/test-s3-permissions")
async def test_s3_permissions():
    try:
        # Test ListBucket
        s3_client.list_objects_v2(Bucket='socio-scan1', MaxKeys=1)
        
        # Test GetObject (using your existing file)
        test_key = "test-file.txt"
        
        # Test PutObject
        s3_client.put_object(
            Bucket='socio-scan1',
            Key=test_key,
            Body='test content'
        )
        
        # Test GetObject
        s3_client.get_object(
            Bucket='socio-scan1',
            Key=test_key
        )
        
        # Test DeleteObject
        s3_client.delete_object(
            Bucket='socio-scan1',
            Key=test_key
        )
        
        return {
            "status": "success",
            "message": "All S3 permissions verified successfully"
        }
        
    except ClientError as e:
        error_code = e.response.get('Error', {}).get('Code', 'Unknown')
        error_message = e.response.get('Error', {}).get('Message', 'Unknown')
        return {
            "status": "error",
            "code": error_code,
            "message": error_message
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
