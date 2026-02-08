
import sys
import os

# Add the current directory to sys.path so we can import app modules
sys.path.append(os.getcwd())

try:
    from app.services.beautify_service import beautify_service
    print("Service imported successfully.")
    
    queries = ["hello worl", "this is a tst"]
    print(f"Original: {queries}")
    corrected = beautify_service.batch_correct(queries)
    print(f"Corrected: {corrected}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
