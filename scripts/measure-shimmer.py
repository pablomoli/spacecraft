import sys, io
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright
# usage: python3 scripts/measure-shimmer.py [gpu|swiftshader]  (dev server on :3000)
mode=sys.argv[1] if len(sys.argv)>1 else "gpu"
args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] if mode=="swiftshader" else ["--use-gl=angle","--use-angle=metal","--enable-gpu","--ignore-gpu-blocklist"]
N=16
with sync_playwright() as pw:
    b=pw.chromium.launch(args=args)
    for label,url in [("bloom off","http://localhost:3000"),("bloom on","http://localhost:3000/?bloom=1")]:
        p=b.new_page(viewport={"width":1200,"height":800},device_scale_factor=2)
        p.goto(url,wait_until="networkidle"); p.wait_for_timeout(8000)
        renderer=p.evaluate("(()=>{const c=document.createElement('canvas');const g=c.getContext('webgl2');const d=g.getExtension('WEBGL_debug_renderer_info');return d?g.getParameter(d.UNMASKED_RENDERER_WEBGL):'?'})()")
        passes=p.evaluate("!!document.querySelector('canvas')")
        frames=[]
        for i in range(N):
            frames.append(np.asarray(Image.open(io.BytesIO(p.screenshot())).convert("RGB")).astype(np.int16)); p.wait_for_timeout(80)
        # crop to the Earth disc region to exclude UI text and the nav column
        d=[np.abs(frames[i+1][200:1400,700:1900]-frames[i][200:1400,700:1900]).mean() for i in range(N-1)]
        print(f"{label:10s} mean inter-frame delta {np.mean(d):.2f}  (min {min(d):.2f} max {max(d):.2f})  renderer={renderer}")
        p.close()
    b.close()
