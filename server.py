import http.server
import socketserver

PORT = 8000

Handler = http.server.SimpleHTTPRequestHandler
# Add proper MIME type for woff2 to avoid warnings/issues
Handler.extensions_map['.woff2'] = 'font/woff2'

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("serving at port", PORT)
    print(f"Open http://localhost:{PORT} in your browser")
    httpd.serve_forever()
