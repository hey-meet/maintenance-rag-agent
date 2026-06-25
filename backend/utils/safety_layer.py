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
    

# Append this function to backend/utils/safety_layer.py

def evaluate_response_quality(response_text: str) -> dict:
    """
    Evaluates the quality and actionability of an LLM maintenance recommendation.
    """
    if not isinstance(response_text, str):
        return {"quality_score": 0.0, "metrics": {}, "passed": False}
        
    lowered = response_text.lower()
    metrics = {
        "has_clear_action": any(word in lowered for word in ["replace", "repair", "check", "inspect", "clean"]),
        "has_step_by_step": any(word in lowered for word in ["step", "procedure", "first", "then", "finally"]),
        "has_safety_mention": any(word in lowered for word in ["power off", "safety", "lockout", "tagout", "wear"])
    }
    
    # Calculate a quality score based on metrics met
    score = sum(1 for met in metrics.values() if met) / len(metrics)
    
    return {
        "quality_score": round(score, 2),
        "metrics": metrics,
        "passed": score >= 0.66  # Must meet at least 2 out of 3 criteria
    }


# Append this function to backend/utils/safety_layer.py

def verify_retrieval_quality(telemetry_alert: dict, retrieved_context: list) -> dict:
    """
    Validates that the retrieved knowledge documents match the incoming telemetry alert context.
    """
    error_code = telemetry_alert.get("error_code", "").lower()
    if not error_code:
        return {"retrieval_valid": False, "match_ratio": 0.0, "reason": "Missing error code in telemetry data."}
        
    matching_docs = 0
    for doc in retrieved_context:
        if error_code in str(doc).lower():
            matching_docs += 1
            
    total_docs = len(retrieved_context)
    match_ratio = (matching_docs / total_docs) if total_docs > 0 else 0.0
    
    return {
        "retrieval_valid": match_ratio >= 0.50 or total_docs == 0,  # Valid if over 50% match relevance
        "match_ratio": round(match_ratio, 2),
        "reason": f"Matched {matching_docs} out of {total_docs} context documents for alert {error_code}."
    }