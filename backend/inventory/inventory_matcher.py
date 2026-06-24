"""
Backend Inventory Matcher — Core Pipeline Component
File Location: backend/inventory/inventory_matcher.py
"""

import json
from pathlib import Path
from typing import Dict, Any, List

# Deterministic path resolution matching the system layout
BASE_DIR = Path(__file__).resolve().parents[2]
DEFAULT_INVENTORY_PATH = BASE_DIR / "data" / "inventory" / "inventory.json"

def load_production_inventory(custom_path: Path = None) -> List[Dict[str, Any]]:
    """
    Loads the production inventory database safely from disk.
    Handles both raw lists and nested dictionary configurations natively.
    """
    target_path = custom_path if custom_path else DEFAULT_INVENTORY_PATH
    
    if not target_path.exists():
        return []

    try:
        with open(target_path, "r", encoding="utf-8") as file:
            data = json.load(file)
            
        # Structure validation check
        if isinstance(data, dict):
            return data.get("inventory", [])
            
        return data if isinstance(data, list) else []
    except (json.JSONDecodeError, IOError):
        return []

def match_parts_to_inventory(recommendation: Dict[str, Any], inventory_path: Path = None) -> Dict[str, Any]:
    """
    Processes the recommendation dictionary contract, updates its tracking parameters,
    and dynamically binds actual structural inventory metrics using precision matching rules.
    
    Args:
        recommendation (dict): The output dictionary from the recommendation engine.
        inventory_path (Path): Optional parameter to override storage coordinates.
        
    Returns:
        dict: The updated recommendation contract containing inventory match matrices.
    """
    if not isinstance(recommendation, dict):
        return recommendation

    spare_parts_requested = recommendation.get("spare_parts_required", [])
    inventory_pool = load_production_inventory(inventory_path)
    
    inventory_matches = []

    for component_query in spare_parts_requested:
        if not component_query or not isinstance(component_query, str):
            continue
            
        normalized_query = component_query.lower().strip()
        
        for item in inventory_pool:
            part_name = str(item.get("part_name", "")).lower()
            part_code = str(item.get("part_code", "")).lower()
            
            # Targeted tracking mapping (strictly part_name and part_code)
            if (normalized_query in part_name or 
                normalized_query in part_code or 
                part_name in normalized_query or 
                part_code in normalized_query):
                
                current_stock = item.get("current_stock", 0)
                minimum_stock = item.get("minimum_stock", 0)
                
                matched_node = {
                    "part_id": item.get("part_id", "UNKNOWN"),
                    "part_name": item.get("part_name", "N/A"),
                    "part_code": item.get("part_code", "N/A"),
                    "current_stock": current_stock,
                    "minimum_stock": minimum_stock,  # Optimized: Transmitted directly to feed frontend warnings
                    "status": item.get("status", "Unknown State"),
                    "warehouse_location": item.get("warehouse_location", "Unassigned Aisle"),
                    "supplier": item.get("supplier", "External Vendor"),
                    "lead_time_days": item.get("lead_time_days", 0),
                    "unit_cost_inr": item.get("unit_cost_inr", 0.0),
                    "available": current_stock > 0,
                    "low_stock": current_stock <= minimum_stock
                }
                
                # Deduplicate entries safely
                if not any(existing["part_id"] == matched_node["part_id"] for existing in inventory_matches):
                    inventory_matches.append(matched_node)

    # Bind parameters natively to the contract root
    recommendation["inventory_matches"] = inventory_matches
    
    # Optimized: Evaluates true operational physical readiness (True only if at least 1 matched item is in stock)
    recommendation["inventory_available"] = any(
        item["available"] 
        for item in inventory_matches
    )

    return recommendation