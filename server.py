import http.server
import json
import os
import sys

PORT = 3000

class JobbyHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/save':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                # Save markdown file
                if 'markdown' in data:
                    with open('resume.md', 'w', encoding='utf-8') as f:
                        f.write(data['markdown'])
                        
                # Save config file
                if 'config' in data:
                    with open('config.json', 'w', encoding='utf-8') as f:
                        json.dump(data['config'], f, indent=4, ensure_ascii=False)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success", "message": "Saved successfully"}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
        else:
            self.send_error(404, "Endpoint not found")

    def do_GET(self):
        if self.path == '/api/load':
            try:
                data = {
                    "markdown": "",
                    "config": None
                }
                
                # Check if resume.md exists, fallback to sample.md
                if os.path.exists('resume.md'):
                    with open('resume.md', 'r', encoding='utf-8') as f:
                        data['markdown'] = f.read()
                elif os.path.exists('sample.md'):
                    with open('sample.md', 'r', encoding='utf-8') as f:
                        data['markdown'] = f.read()
                
                # Check if config.json exists
                if os.path.exists('config.json'):
                    with open('config.json', 'r', encoding='utf-8') as f:
                        data['config'] = json.load(f)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
        else:
            # Standard static file serving
            super().do_GET()

    # Enable CORS for development safety
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

if __name__ == '__main__':
    # Force utf-8 encoding on standard streams for Windows terminal safety
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
    
    server_address = ('127.0.0.1', PORT)
    httpd = http.server.HTTPServer(server_address, JobbyHandler)
    print(f"jobby MD Editor Server running at http://127.0.0.1:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer shutting down.")
        httpd.server_close()
