import socket
import psutil

def check_port(port):
    # Check if port is in use
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('localhost', port))
            print(f"Port {port} is available!")
            return True
        except OSError:
            print(f"Port {port} is in use!")
            # Find process using the port
            for proc in psutil.process_iter(['pid', 'name', 'connections']):
                try:
                    for conn in proc.info['connections']:
                        if conn.laddr.port == port:
                            print(f"Process using port {port}:")
                            print(f"PID: {proc.info['pid']}")
                            print(f"Name: {proc.info['name']}")
                            return False
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            return False

if __name__ == '__main__':
    port = 8000
    check_port(port)
