print("Start")
import os
from dotenv import load_dotenv
print("Imported dotenv")
load_dotenv(os.path.join(os.path.dirname(__file__), "../server/.env"))
print("Loaded env")
try:
    import opik
    print("Imported opik")
except Exception as e:
    print(f"Failed to import opik: {e}")

try:
    print("Initializing Opik client...")
    client = opik.Opik()
    print("Created Opik client")
except Exception as e:
    print(f"Failed to create Opik client: {e}")

try:
    print("Creating dataset...")
    dataset = client.get_or_create_dataset(name="test-dataset")
    print(f"Created dataset: {dataset.name}")
except Exception as e:
    print(f"Failed to create dataset: {e}")

print("Done")
