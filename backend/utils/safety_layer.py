# backend/utils/safety_layer.py

def validate_llm_response(response_text: str) -> dict:
    """
    Validates LLM recommendations for safety and completeness.
    """
    if not response_text or len(response_text.strip()) < 10:
        return {"is_safe": False, "score": 0.0, "reason": "Empty or insufficient response."}
        
    return {"is_safe": True, "score": 1.0, "reason": "Passed initial pass."}


def validate_llm_response(response_text: str) -> dict:
    lowered_text = response_text.lower()
    
    # Simple safety check: Ensure it doesn't contain hazardous, unverified bypass instructions
    prohibited_actions = ["bypass safety", "ignore error code", "force override dangerous"]
    for action in prohibited_actions:
        if action in lowered_text:
            return {"is_safe": False, "score": 0.1, "reason": f"Prohibited action detected: {action}"}
            
    # Basic confidence scoring based on presence of structured metrics
    score = 1.0
    if "recommendation" not in lowered_text: score -= 0.3
    if "procedure" not in lowered_text: score -= 0.3
    
    return {
        "is_safe": score >= 0.5,
        "score": round(score, 2),
        "reason": "Validation rules executed successfully."
    }


# Append this function to backend/utils/safety_layer.py

def enforce_confidence_threshold(validation_result: dict, min_threshold: float = 0.70) -> dict:
    """
    Evaluates the validation score and flags low-confidence responses for rejection.
    """
    score = validation_result.get("score", 0.0)
    if score < min_threshold:
        return {
            "status": "REJECTED",
            "score": score,
            "action": "Fallback to static safe response or request regeneration.",
            "reason": f"Confidence score {score} is below the strict threshold of {min_threshold}."
        }
    return {"status": "PASSED", "score": score, "action": "PROCEED", "reason": "Meets criteria."}



def validate_llm_response(response_text: str) -> dict:
    """
    Validates LLM recommendations for safety and completeness with robust error checking.
    """
    try:
        # Edge case: handling invalid types gracefully
        if not isinstance(response_text, str):
            return {"is_safe": False, "score": 0.0, "reason": "Invalid payload format: Text must be a string."}

        if not response_text or len(response_text.strip()) < 10:
            return {"is_safe": False, "score": 0.0, "reason": "Empty or insufficient response."}

        lowered_text = response_text.lower()
        prohibited_actions = ["bypass safety", "ignore error code", "force override dangerous"]
        for action in prohibited_actions:
            if action in lowered_text:
                return {"is_safe": False, "score": 0.1, "reason": f"Prohibited action detected: {action}"}
                
        score = 1.0
        if "recommendation" not in lowered_text: score -= 0.3
        if "procedure" not in lowered_text: score -= 0.3
        
        return {"is_safe": score >= 0.5, "score": round(score, 2), "reason": "Validation rules executed successfully."}
        
    except Exception as e:
        return {"is_safe": False, "score": 0.0, "reason": f"System error during validation run: {str(e)}"}