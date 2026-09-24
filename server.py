"""
RepoMind Local Development Server
Zero-dependency static file server with correct ES module MIME types.
"""

import http.server
import socketserver
import os
import sys

PORT = 5173

class RepoMindHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        '': 'application/octet-stream',
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.mjs': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.ico': 'image/x-icon',
        '.woff2': 'font/woff2',
        '.woff': 'font/woff',
        '.ttf': 'font/ttf'
    }

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    socketserver.TCPServer.allow_reuse_address = True
    
    port = PORT
    for attempt in range(5):
        try:
            with socketserver.TCPServer(("", port), RepoMindHTTPRequestHandler) as httpd:
                print(f"[RepoMind] Server online at: http://localhost:{port}")
                print(f"[RepoMind] Serving directory: {os.getcwd()}")
                print(f"[RepoMind] Press Ctrl+C to terminate.")
                httpd.serve_forever()
                break
        except OSError:
            print(f"[RepoMind] Port {port} occupied, attempting port {port + 1}...")
            port += 1

if __name__ == "__main__":
    try:
        run_server()
    except KeyboardInterrupt:
        print("\n[RepoMind] Server shutdown cleanly.")
        sys.exit(0)
