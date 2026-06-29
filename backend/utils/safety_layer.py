# backend/utils/safety_layer.py

def validate_llm_response(response_text: str) -> dict:
    """
    Validates LLM recommendations for safety, structure, and completeness.
    """
    try:
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
    
    score = sum(1 for met in metrics.values() if met) / len(metrics)
    return {
        "quality_score": round(score, 2),
        "metrics": metrics,
        "passed": score >= 0.66
    }


def verify_retrieval_quality(telemetry_alert: dict, retrieved_context: list) -> dict:
    """
    Validates that the retrieved knowledge documents match the incoming telemetry alert context.
    """
    if not isinstance(telemetry_alert, dict):
        return {"retrieval_valid": False, "match_ratio": 0.0, "reason": "Invalid telemetry schema profile."}
        
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
        "retrieval_valid": match_ratio >= 0.50 or total_docs == 0,
        "match_ratio": round(match_ratio, 2),
        "reason": f"Matched {matching_docs} out of {total_docs} context documents for alert {error_code}."
    }


def check_string_overflow_bounds(text: str, max_chars: int = 10000) -> bool:
    if not isinstance(text, str):
        return False
    return len(text) <= max_chars


def validate_worker_assignment_flow(worker_payload: dict) -> dict:
    if not isinstance(worker_payload, dict):
        return {"valid": False, "reason": "Worker payload must be a structured dictionary."}
    if not worker_payload.get("worker_id") or not worker_payload.get("status"):
        return {"valid": False, "reason": "Missing or empty required worker parameter."}
    return {"valid": True, "reason": "Worker assignment parameters successfully validated."}


def validate_recommendation_schema(recommendation_text: str) -> dict:
    if not isinstance(recommendation_text, str) or not recommendation_text.strip():
        return {"schema_valid": False, "reason": "Recommendation data content cannot be null or empty."}
    lower_text = recommendation_text.lower()
    if "procedure" not in lower_text and "step" not in lower_text:
         return {"schema_valid": False, "reason": "Recommendation text missing step-by-step operating guidelines."}
    return {"schema_valid": True, "reason": "Recommendation schema attributes cleared."}


def run_end_to_end_validation_pipeline(telemetry_alert: dict, retrieved_context: list, llm_response: str) -> dict:
    """
    Orchestrates the complete validation pipeline with telemetry, validation, and error safety.
    """
    try:
        if telemetry_alert is None or retrieved_context is None or llm_response is None:
            return {"pipeline_passed": False, "stage": "STRUCTURAL_HARDENING", "reason": "Null payload components detected."}
            
        if not isinstance(telemetry_alert, dict) or not isinstance(retrieved_context, list):
            return {"pipeline_passed": False, "stage": "STRUCTURAL_HARDENING", "reason": "Invalid input data structure types."}

        if not check_string_overflow_bounds(llm_response):
            return {"pipeline_passed": False, "stage": "SAFETY_CHECKS", "reason": "Input length limit exceeded limits."}

        retrieval_chk = verify_retrieval_quality(telemetry_alert, retrieved_context)
        if not retrieval_chk["retrieval_valid"]:
            return {"pipeline_passed": False, "stage": "RETRIEVAL", "reason": retrieval_chk["reason"]}
            
        safety_chk = validate_llm_response(llm_response)
        if not safety_chk["is_safe"]:
            return {"pipeline_passed": False, "stage": "SAFETY_CHECKS", "reason": safety_chk["reason"]}
            
        quality_chk = evaluate_response_quality(llm_response)
        if not quality_chk["passed"]:
            return {"pipeline_passed": False, "stage": "QUALITY_GRADING", "reason": "LLM response failed minimum quality metrics."}
            
        return {"pipeline_passed": True, "stage": "COMPLETE", "reason": "All end-to-end integration boundaries successfully cleared."}
    except Exception as e:
        return {"pipeline_passed": False, "stage": "UNEXPECTED_FAILURE", "reason": str(e)}