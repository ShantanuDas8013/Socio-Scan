import os
import socket
from dotenv import load_dotenv
from api.scan_resume import app

def check_port_available(port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sock.bind(('localhost', port))
        available = True
    except OSError:
        available = False
    sock.close()
    return available

if __name__ == '__main__':
    # Load environment variables
    load_dotenv()
    
    # Verify environment variables
    required_vars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"Error: Missing environment variables: {', '.join(missing_vars)}")
        exit(1)

    PORT = 8000
    if not check_port_available(PORT):
        print(f"Error: Port {PORT} is already in use!")
        print("Please either:")
        print("1. Stop any other service using port 8000")
        print("2. Change the port number in run_server.py")
        exit(1)
    
    print("Starting Flask server...")
    print(f"Server will be available at http://localhost:{PORT}")
    try:
        # Change host to 'localhost' instead of '0.0.0.0' for better security
        app.run(host='localhost', port=PORT, debug=True)
    except Exception as e:
        print(f"Failed to start server: {str(e)}")
        exit(1)
