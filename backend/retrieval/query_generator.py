def generate_query_from_alert(alert):
    """
    Generates an optimized search term strictly targeting alphanumeric 
    fault codes to keep retrieval metrics high.
    """
    error_code = alert.get("error_code", "").strip()
    machine_id = alert.get("machine_id", "").strip()
    
    # If the error code is a numeric string or code name like '414'
    if error_code:
        # Strict industrial lookup query formula
        # Returns clean targeted lookup keyword like: "ALARM 414 error troubleshooting"
        clean_code = error_code.replace("_", " ").upper()
        return f"ALARM {clean_code} troubleshooting repair procedures"
        
    # Fallback to general machine context if no code present
    return f"Maintenance documentation for {machine_id} troubleshooting steps"