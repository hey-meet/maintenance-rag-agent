# API Response Requirements

## Purpose

This document defines the response fields required by the frontend pages in the industrial maintenance command center.  
The goal is to keep the backend response structure stable, predictable, and easy to consume by the UI without extra transformation logic.

---

## Core Response Principles

- Every response should include a `status` field where applicable.
- Page payloads should remain UI-friendly and grouped by feature area.
- Nested objects should be used for sections that belong together.
- Mock data must match the final backend contract as closely as possible.
- Future LLM-generated outputs should follow the same field names used in these requirements.

---

## 1. Dashboard

### Required Response Fields

#### systemOverview
- active_alerts
- open_work_orders
- indexed_manuals
- inventory_risks
- vector_chunks

#### machineHealthMatrix
- alerts

#### liveVitals
- telemetry

#### diagnosticFlow
- agent_state
- manual_context
- inventory_context
- active_work_order

#### activeAlerts
- array of current alerts

#### predictiveMaintenance
- array of inventory risk items or predictive maintenance items

#### workOrders
- array of work order items

#### activityFeed
- alerts
- work_orders

### Notes
- Dashboard should be the summary page for operational state.
- It should combine alerts, work orders, inventory risk, and agent status in one response.
- All data should be returned in a single payload for fast rendering.

---

## 2. AI Assistant

### Required Response Fields

#### assistant_status
- state
- active_alerts
- pending_tasks
- open_work_orders
- vector_chunks
- agent_health

#### active_alerts
- id
- component
- issue
- severity
- timestamp

#### memory_context
- severity
- department
- estimated_time
- recommended_steps
- required_tools
- required_parts
- inventory_status
- work_order

#### processing_response
- accepted
- state
- message

#### pipeline_logs
- timestamp
- message

### Notes
- Assistant page should be the main AI reasoning and recommendation space.
- It should support both live status and eventual LLM-generated recommendations.
- The same structure should work for mock output now and final model output later.

---

## 3. Alerts

### Required Response Fields

#### alerts
- alert_id
- machine_id
- error_code
- temperature
- severity
- status
- timestamp

### Notes
- Alerts should be shown in descending relevance or severity order.
- Critical alerts should be easy to highlight in the UI.
- The shape should remain minimal and stable.

---

## 4. Work Orders

### Required Response Fields

#### work_orders
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

### Notes
- Work orders should carry both operational data and AI-assisted repair guidance.
- `recommended_steps`, `required_tools`, and `required_parts` are future LLM output fields.
- `manual_reference` should link the work order to source documentation.

---

## 5. Inventory

### Required Response Fields

#### inventory
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

### Notes
- Inventory should clearly show risk and availability.
- Low-stock and out-of-stock items should be visually emphasized.
- This endpoint supports maintenance planning and spare-part readiness.

---

## 6. Upload Manuals

### Required Response Fields

#### manuals
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

### Notes
- Manual uploads should support knowledge base visibility.
- Indexed chunk counts are important for RAG readiness.
- This page should reflect ingestion status and indexing progress.

---

## 7. Analytics

### Required Response Fields

#### executive_kpis
- id
- label
- value
- trend
- status
- desc

#### maintenance_trends
- week
- preventive
- corrective
- emergency

#### alert_distribution
- severity
- recurringCodes

#### machine_hotspots
- name
- health
- alerts
- downtime
- risk
- riskClass

#### telemetry_trends
- metric
- status
- val
- dev
- state
- bars

#### rag_performance
- metrics
- insights

#### knowledge_base_data
- stats
- progress

#### work_order_analytics
- statusDistribution
- departments

#### inventory_risks
- part
- status
- stock
- leadTime
- risk

#### ai_insights
- type
- text
- action

#### factory_performance
- area
- availability
- reliability
- cost
- risk
- riskState

### Notes
- Analytics page should present operational trends and AI performance together.
- KPI and trend labels should remain stable for chart and card rendering.
- This page is suitable for executive-level reporting.

---

## 8. Reports

### Required Response Fields

#### overview_metrics
- total_reports_generated
- reports_this_month
- assets_covered_percent
- compliance_score
- open_audit_findings
- ai_generated_reports

#### report_generation_options
- assets
- date_ranges
- report_types

#### report_library
- id
- name
- type
- generated_by
- date
- machine
- status
- format
- risk_level
- health_trend
- mttr_impact
- savings
- summary
- findings
- risks
- actions

#### reliability_snapshot
- top_risk_assets
- most_frequent_failure_code
- highest_workload_department
- compliance_trend
- preventive_vs_corrective

#### ai_recommendations
- title
- severity
- business_impact
- action
- benefit

#### compliance_metrics
- loto_compliance
- inspection_completion
- documentation_coverage
- manual_reference_coverage
- safety_audit_pass_rate

#### export_center
- formats
- export_ready
- last_generated_report

### Notes
- Reports should support both summary cards and detailed report listing.
- The library payload should be enough for a table view or report detail drawer.
- Generate actions should remain simple and safe.

---

## 9. Settings

### Required Response Fields

#### settings
- telemetry
- retrieval
- reasoning
- safety
- memory

### Subfields

#### telemetry
- critical_temp
- critical_vibration
- pressure_drop
- escalation_delay
- auto_work_order

#### retrieval
- similarity_score
- top_k
- chunk_size
- chunk_overlap
- source_priority
- confidence_cutoff

#### reasoning
- llm_provider
- active_model
- max_context
- temperature
- max_repair_steps
- multi_step_planning
- tool_recommendation
- part_recommendation
- safety_validation_layer

#### safety
- loto_verification
- human_approval
- citation_required
- auto_reject_low_confidence

#### memory
- context_window
- memory_depth
- store_previous_repairs
- use_historical_orders

### Notes
- Settings page should expose runtime configuration in a clear, grouped format.
- These values will later control LLM behavior and safe recommendation generation.

---

## 10. Agent Health and Integration Status

### Required Response Fields

#### agent_health
- agent_status
- retrieval_accuracy
- avg_context_score
- avg_response_time_ms
- indexed_manuals
- vector_chunks
- query_success_rate

#### integrations
- name
- status
- endpoint

#### retrieval_metrics
- estimated_context_precision
- indexed_corpus_weight
- active_manuals
- average_chunk_score
- retrieval_latency_ms

#### memory_metrics
- memory_usage_mb
- memory_limit_mb
- stored_repair_histories
- historical_work_orders
- active_context_sessions

### Notes
- These responses support operational monitoring and system readiness checks.
- They are useful for system settings and admin views.

---

## Summary

This project uses a single backend style with modular page-specific payloads.  
The response contracts above should remain stable so the frontend can render directly without additional mapping layers.