"""本机截图接收端：POST /save?name=<文件名>，正文为 dataURL 文本，解码后写入 shots/。只监听 127.0.0.1。"""
import base64, os, re, sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
OUT = sys.argv[1]
class H(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*'); self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    def do_OPTIONS(self):
        self.send_response(204); self._cors(); self.end_headers()
    def do_POST(self):
        q = parse_qs(urlparse(self.path).query); name = re.sub(r'[^A-Za-z0-9_.-]', '_', q.get('name', ['shot.jpg'])[0])
        body = self.rfile.read(int(self.headers.get('Content-Length', 0))).decode()
        data = base64.b64decode(body.split(',', 1)[1]); open(os.path.join(OUT, name), 'wb').write(data)
        self.send_response(200); self._cors(); self.end_headers(); self.wfile.write(f'{name} {len(data)}'.encode())
    def log_message(self, *a): pass
HTTPServer(('127.0.0.1', int(sys.argv[2]) if len(sys.argv) > 2 else 8799), H).serve_forever()
