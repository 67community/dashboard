#!/usr/bin/env python3
"""HTTP server on port 9867 — sends messages to X 67 Chat via Playwright."""
import json, time
from http.server import HTTPServer, BaseHTTPRequestHandler
from playwright.sync_api import sync_playwright

AUTH_TOKEN = "af4c97054cedcc7783c713dca57e5148daeff83b"
PIN = "1207"

pw = None
browser = None
context = None
page = None

def init():
    global pw, browser, context, page
    print("🚀 Launching browser...")
    pw = sync_playwright().start()
    browser = pw.chromium.launch(headless=False)
    context = browser.new_context()
    context.add_cookies([{
        "name": "auth_token", "value": AUTH_TOKEN,
        "domain": ".x.com", "path": "/", "secure": True, "httpOnly": True
    }])
    page = context.new_page()
    
    # Go to chat list
    page.goto("https://x.com/i/chat", wait_until="domcontentloaded", timeout=30000)
    page.wait_for_timeout(5000)
    
    # Handle PIN if needed
    content = page.content()
    if "senha" in content.lower() or "password" in content.lower():
        print("🔐 Entering PIN...")
        page.keyboard.type(PIN)
        page.wait_for_timeout(500)
        page.keyboard.press("Enter")
        page.wait_for_timeout(5000)
    
    # Click 67 Chat
    try:
        page.locator("text=67 Chat").first.click()
        page.wait_for_timeout(5000)
        print(f"✅ In 67 Chat — URL: {page.url}")
    except:
        print("⚠️ Could not find 67 Chat")
    
    page.screenshot(path="/tmp/xchat_ready.png")
    print("✅ Ready!")

def send_msg(text):
    global page
    for sel in ['[placeholder="Mensagem"]', '[placeholder="Message"]', 'div[contenteditable="true"]']:
        try:
            el = page.locator(sel).first
            if el.count() > 0:
                el.click(timeout=3000)
                page.keyboard.type(text)
                page.wait_for_timeout(300)
                page.keyboard.press("Enter")
                page.wait_for_timeout(2000)
                return True, "sent"
        except:
            continue
    return False, "No input found"

class H(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == "/send":
            n = int(self.headers.get("Content-Length", 0))
            b = json.loads(self.rfile.read(n)) if n else {}
            t = b.get("text", "").strip()
            if not t:
                self._resp(400, {"error": "empty"})
                return
            ok, msg = send_msg(t)
            self._resp(200 if ok else 500, {"ok": ok, "message": msg})
        else:
            self._resp(404, {"error": "not found"})
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
    
    def _resp(self, code, data):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def log_message(self, f, *a): pass

if __name__ == "__main__":
    init()
    server = HTTPServer(("0.0.0.0", 9867), H)
    print("🟢 http://localhost:9867/send")
    server.serve_forever()
