import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# AWS Credentials
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION', 'ap-south-1')
AWS_S3_BUCKET = os.getenv('AWS_S3_BUCKET', 'socio-scan1')

# AWS Config dictionary for convenient access
AWS_CONFIG = {
    'aws_access_key_id': AWS_ACCESS_KEY_ID,
    'aws_secret_access_key': AWS_SECRET_ACCESS_KEY,
    'region_name': AWS_REGION,
}

# Print configuration for debugging (remove in production)
print(f"AWS Configuration:")
print(f"  Region: {AWS_REGION}")
print(f"  Bucket: {AWS_S3_BUCKET}")
print(f"  Access Key ID: {'Configured' if AWS_ACCESS_KEY_ID else 'MISSING'}")
print(f"  Secret Key: {'Configured' if AWS_SECRET_ACCESS_KEY else 'MISSING'}")
