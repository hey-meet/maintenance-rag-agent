# Backend API Analysis

## Purpose

This document records the current backend routes in `backend/api/telemetry.py`, the response patterns they use, and the gaps that matter for Week 4 LLM integration.

---

## File Overview

`telemetry.py` currently contains responses for:

- Dashboard
- Alerts
- Work Orders
- Inventory
- Manuals
- Agent status and memory
- Agent pipeline logs
- Analytics
- Reports
- Settings
- Deployment and reset endpoints

This makes the file the main contract source for the frontend and the future recommendation engine.

---

## 1. Dashboard Route

### Route
`GET /dashboard`

### Returned Sections
- systemOverview
- machineHealthMatrix
- liveVitals
- diagnosticFlow
- activeAlerts
- predictiveMaintenance
- workOrders
- activityFeed

### Observations
- Good aggregation layer for the homepage.
- It already combines alerts, work orders, inventory, and agent data.
- It is suitable as a single summary endpoint for the dashboard UI.

### Gap
- No explicit `status` wrapper at top level.
- Some sections rely on helper routes and assume their keys exist.

---

## 2. Alerts Route

### Route
`GET /alerts`

### Response Shape
- status
- alerts

### Alert Fields
- alert_id
- machine_id
- error_code
- temperature
- severity
- status
- timestamp

### Observations
- Clean and minimal schema.
- Good for alert table and alert cards.
- Severity and status are already usable for filtering.

### Gap
- No pagination or sorting metadata.
- No field for source telemetry stream.

---

## 3. Work Orders Route

### Route
`GET /work-orders`

### Response Shape
- status
- work_orders

### Work Order Fields
- work_order_id
- machine_id
- error_code
- priority
- status
- assigned_department
- due_date
- recommended_steps
- required_tools
- required_parts
- manual_reference

### Observations
- This is already close to final AI-ready structure.
- It mixes static CMMS data with future AI output fields.
- Great bridge between retrieval and frontend work order display.

### Gap
- `error_code` field sometimes contains long descriptive text instead of a short pure code.
- A more consistent split between `error_code` and `error_description` would help.

---

## 4. Inventory Route

### Route
`GET /inventory`

### Response Shape
- status
- inventory

### Inventory Fields
- part_id
- part_name
- part_code
- category
- current_stock
- minimum_stock
- status
- warehouse_location
- supplier
- lead_time_days
- unit_cost_inr
- compatible_machines
- linked_work_orders

### Observations
- Strong schema for inventory risk tracking.
- Ideal for spare part recommendation logic.
- Compatible with work order dependency display.

### Gap
- No derived risk score.
- No reorder recommendation field.

---

## 5. Manuals Route

### Route
`GET /manuals`

### Response Shape
- status
- total_manuals
- manuals

### Manual Fields
- manual_id
- machine_id
- file_name
- manual_type
- version
- pages
- status
- upload_date
- total_chunks
- indexed_chunks

### Observations
- Very useful for RAG readiness.
- Page count and chunk count support indexing visibility.
- Great foundation for the knowledge base dashboard.

### Gap
- No explicit indexing progress percentage.
- No per-manual embedding or retrieval health.

---

## 6. Single Manual Route

### Route
`GET /manuals/{manual_id}`

### Response Shape
- status
- manual

### Observations
- Good for manual detail view.
- Uses uppercase lookup safely.

### Gap
- Manual ID lookup depends on generated IDs, not the original filename key.
- This can confuse debugging if the UI expects direct filename access.

---

## 7. Agent Status Route

### Route
`GET /agent/status`

### Response Fields
- state
- active_alerts
- pending_tasks
- open_work_orders
- vector_chunks
- agent_health

### Observations
- Good lightweight health snapshot.
- Works well for the assistant page and dashboard summary.

### Gap
- No retrieval accuracy or confidence statistics here.
- State values are not formally enumerated.

---

## 8. Agent Alerts Route

### Route
`GET /agent/alerts`

### Response Shape
- array of formatted alerts

### Returned Fields
- id
- component
- issue
- severity
- timestamp

### Observations
- Nice UI-friendly transformation of raw alert data.
- Good for assistant-specific alert feed.

### Gap
- No top-level wrapper object.
- Timestamp is overloaded with `"Active"` and `"Resolved"` instead of a real timestamp.

---

## 9. Agent Process Route

### Route
`POST /agent/process`

### Input
- payload dict

### Response Fields
- accepted
- state
- message

### Observations
- Works as a mock intake endpoint for LLM-triggered alerts.
- Good skeleton for future orchestration.

### Gap
- No request schema validation.
- No output trace for processed alert context.

---

## 10. Agent Pipeline Route

### Route
`GET /agent/pipeline`

### Response Shape
- array of log entries

### Log Fields
- timestamp
- message

### Observations
- Useful for visual pipeline tracing.
- Good for explaining backend activity in the UI.

### Gap
- No stage, status, or severity fields.
- Logs are more narrative than structured.

---

## 11. Agent Memory Route

### Route
`GET /agent/memory`

### Response Fields
- severity
- department
- estimated_time
- recommended_steps
- required_tools
- required_parts
- inventory_status
- work_order

### Observations
- This is very close to future LLM output.
- It already combines alerts, work orders, and inventory dependencies.
- This route is one of the strongest foundations for Day 4 integration.

### Gap
- No confidence score.
- No manual references.
- No safety notes.
- No root cause field.

---

## 12. Agent Work Order Route

### Route
`GET /agent/work-order`

### Response Fields
- id
- machine
- priority
- status
- assigned_team
- estimated_time

### Observations
- Minimal, but useful for quick summary widgets.

### Gap
- Too small for real assistant use.
- No repair details or source references.

---

## 13. Analytics Route

### Route
`GET /analytics`

### Returned Blocks
- executive_kpis
- maintenance_trends
- alert_distribution
- machine_hotspots
- telemetry_trends
- rag_performance
- knowledge_base_data
- work_order_analytics
- inventory_risks
- ai_insights
- factory_performance

### Observations
- This is the most feature-rich analytics endpoint.
- It already covers both operational health and AI performance.
- Strong enough for charts, trend cards, and executive dashboards.

### Gap
- Some field names are mixed in style.
- Numeric values are often stored as strings instead of raw numbers.
- Some chart data may need normalization later.

---

## 14. Reports Route

### Route
`GET /reports`

### Returned Blocks
- overview_metrics
- report_generation_options
- report_library
- reliability_snapshot
- ai_recommendations
- compliance_metrics
- export_center

### Observations
- Very complete report center payload.
- Good support for list view, summary cards, and recommendation tiles.
- Excellent structure for frontend reports page.

### Gap
- Several fields are hardcoded and descriptive.
- `report_library` items are detailed but may become large for real API usage.

---

## 15. Single Report Route

### Route
`GET /reports/{report_id}`

### Response Fields
- status
- report

### Observations
- Clean detail route.
- Works well for drill-down report pages.

### Gap
- No metadata if report is missing beyond a simple error payload.

---

## 16. Generate Report Route

### Route
`POST /reports/generate`

### Response Fields
- status
- report_id
- message
- estimated_completion

### Observations
- Good async-style placeholder for future generation workflows.

### Gap
- No task tracking status or queue ID.

---

## 17. Settings Route

### Route
`GET /settings`

### Returned Blocks
- telemetry
- retrieval
- reasoning
- safety
- memory

### Observations
- Very important for future model orchestration.
- Exposes the parameters that will control LLM behavior.
- Good planning layer for Day 4 and Day 5.

### Gap
- Some model-specific names are still placeholder-like.
- These values should eventually come from environment or config, not only static payloads.

---

## 18. Agent Health Route

### Route
`GET /settings/agent-health`

### Response Fields
- agent_status
- retrieval_accuracy
- avg_context_score
- avg_response_time_ms
- indexed_manuals
- vector_chunks
- query_success_rate

### Observations
- Good monitoring endpoint.
- Valuable for both admin view and model tuning.

### Gap
- No historical trend data.

---

## 19. Integrations Route

### Route
`GET /settings/integrations`

### Response Fields
- integrations array with
  - name
  - status
  - endpoint

### Observations
- Good platform visibility.
- Useful for system administration.

### Gap
- No health detail or last sync time.

---

## 20. Retrieval Metrics Route

### Route
`GET /settings/retrieval-metrics`

### Response Fields
- estimated_context_precision
- indexed_corpus_weight
- active_manuals
- average_chunk_score
- retrieval_latency_ms

### Observations
- Very useful for RAG observability.
- Useful for validating improvements after LLM integration.

---

## 21. Memory Metrics Route

### Route
`GET /settings/memory-metrics`

### Response Fields
- memory_usage_mb
- memory_limit_mb
- stored_repair_histories
- historical_work_orders
- active_context_sessions

### Observations
- Good runtime memory health view.
- Helpful for assistant performance monitoring.

---

## 22. Deploy Route

### Route
`POST /settings/deploy`

### Response Fields
- status
- message
- deployment_id
- affected_services

### Observations
- Good placeholder for runtime config deployment.
- Useful if settings become editable later.

---

## 23. Reset Route

### Route
`POST /settings/reset`

### Response Fields
- status
- message
- baseline_profile

### Observations
- Good rollback endpoint.
- Useful for testing configuration recovery.

---

## Strengths of the Current Backend

- Strong page coverage.
- Good mock payload density.
- Clear separation of functional areas.
- Most frontend pages already have data.
- Excellent foundation for future LLM integration.

---

## Current Gaps Before Day 4

- No formal request/response validation models for LLM output.
- Some fields are strings where numbers would be better.
- Some routes return arrays without a top-level wrapper.
- `agent/memory` is close to the final schema but still missing confidence, root cause, and safety notes.
- There is no dedicated recommendation endpoint yet.
- Some IDs and descriptions are mixed together in a few places.

---

## Recommendation for Day 4

Before integrating Gemini/OpenAI:
- freeze the response contract
- validate recommendation schema
- add typed request/response models
- keep manual references and safety notes mandatory
- make sure the frontend consumes a stable structure

---

## Conclusion

`telemetry.py` is already doing the work of a backend contract prototype.  
The next step is not more mock data. The next step is to lock the schema and then plug in the LLM layer safely.