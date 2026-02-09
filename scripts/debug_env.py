import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "../server/.env"))
val = os.getenv('GEMINI_API_KEY')
if val:
    print(f"GEMINI_API_KEY: Present ({val[:4]}...{val[-4:]})")
else:
    print("GEMINI_API_KEY: Missing")

val = os.getenv('GOOGLE_API_KEY')
if val:
    print(f"GOOGLE_API_KEY: Present ({val[:4]}...{val[-4:]})")
else:
    print("GOOGLE_API_KEY: Missing")

import litellm
print("LiteLLM imported")
