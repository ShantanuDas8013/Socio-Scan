from dotenv import load_dotenv
import os

load_dotenv()

AWS_CONFIG = {
    'aws_access_key_id': os.getenv('AWS_ACCESS_KEY_ID'),
    'aws_secret_access_key': os.getenv('AWS_SECRET_ACCESS_KEY'),
    'region_name': os.getenv('AWS_REGION'),
    'bucket_name': 'socio-scan1'
}
