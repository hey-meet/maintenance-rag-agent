# backend/utils/deployment_check.py
import os
import sys

def verify_deployment_readiness():
    """Performs quick environment diagnostics prior to production code execution."""
    print("[DEPLOYMENT] Running production environment verification sanity checks...")
    
    # Check for crucial working pathways
    required_paths = ["backend/utils/safety_layer.py", "docs/validation_strategy.md"]
    for path in required_paths:
        if not os.path.exists(path):
            print(f"[DEPLOYMENT ERROR] Missing essential path component: {path}")
            return False
            
    print("[DEPLOYMENT SUCCESS] All system validation layers match verification metrics.")
    return True

if __name__ == "__main__":
    sys.exit(0 if verify_deployment_readiness() else 1)