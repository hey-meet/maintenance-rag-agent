# Recommendation Response Schema

## Purpose

This schema defines the expected structured output from the LLM when the assistant generates a maintenance recommendation.

The response should be:
- machine-readable
- safe for frontend rendering
- easy to validate
- consistent with work order and alert flows

---

## Canonical Recommendation Schema

```json
{
  "machine_id": "",
  "error_code": "",
  "root_cause": "",
  "severity": "",
  "confidence_score": 0.0,
  "summary": "",
  "repair_steps": [],
  "tools": [],
  "spare_parts": [],
  "manual_references": [],
  "safety_notes": [],
  "estimated_time_minutes": 0,
  "priority": "",
  "recommended_action": "",
  "fallback_message": ""
}