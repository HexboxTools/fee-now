#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
python3 build.py
TOKEN=$(tr -d '\n' < /workspace/cfln/cf-token.secret)
ACCOUNT=61de9af4794ffb477932255d053b6321
NAME=hexbox-fees
# multipart upload (ES module worker)
RESP=$(python3 - << PY
import json, urllib.request, mimetypes, uuid, pathlib
token = open("/workspace/cfln/cf-token.secret").read().strip()
account = "$ACCOUNT"
name = "$NAME"
body_js = pathlib.Path("src/index.js").read_bytes()
boundary = uuid.uuid4().hex
metadata = json.dumps({
    "main_module": "index.js",
    "compatibility_date": "2026-11-06",
})
def part(name, content, filename=None, ctype="application/json"):
    disp = f'Content-Disposition: form-data; name="{name}"'
    if filename:
        disp += f'; filename="{filename}"'
    return (f"--{boundary}\r\n{disp}\r\nContent-Type: {ctype}\r\n\r\n").encode() + content + b"\r\n"
blob = b"".join([
    part("metadata", metadata.encode(), ctype="application/json"),
    part("index.js", body_js, filename="index.js", ctype="application/javascript+module"),
    f"--{boundary}--\r\n".encode(),
])
req = urllib.request.Request(
    f"https://api.cloudflare.com/client/v4/accounts/{account}/workers/scripts/{name}",
    data=blob,
    method="PUT",
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": f"multipart/form-data; boundary={boundary}",
    },
)
try:
    with urllib.request.urlopen(req) as r:
        raw = r.read()
        print(raw.decode()[:2000])
except Exception as e:
    if hasattr(e, "read"):
        print(e.read().decode()[:3000])
    raise
PY
)
echo "---- enable workers.dev ----"
curl -sS -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT/workers/scripts/$NAME/subdomain" \
  --data '{"enabled":true}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success'), d.get('errors'), d.get('result'))"
echo "LIVE https://hexbox-fees.hexboxtools.workers.dev/"
