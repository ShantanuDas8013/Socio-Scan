from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import boto3
from botocore.exceptions import ClientError
from config import AWS_CONFIG, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET
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

# Initialize S3 client with explicit credentials
s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

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
                
            print(f"Extracted S3 URL - Bucket: {bucket_name}, Key: {key}")
            
            # Use S3 client with explicit credentials
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
                
        except Exception as e:
            print(f"Error accessing S3: {str(e)}")
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

# Test S3 connection on startup
@app.get("/test-s3-permissions")
async def test_s3_permissions():
    try:
        # List buckets to verify connection
        response = s3_client.list_buckets()
        buckets = [bucket['Name'] for bucket in response['Buckets']]
        return {"success": True, "buckets": buckets}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
