
import os
print("cwd:", os.getcwd())
print("HOME:", os.environ.get("HOME"))
import subprocess
result = subprocess.run(["find", "/", "-name", "checklist-step-2.ts", "-maxdepth", "8"], 
                       capture_output=True, text=True, timeout=10)
print(result.stdout[:500])
print(result.stderr[:200])