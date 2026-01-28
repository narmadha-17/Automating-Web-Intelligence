from typing import List

def validate_non_empty_list(v: List[str], field_name: str) -> List[str]:
    if not v:
        raise ValueError(f"At least one {field_name} is required")
    
    valid_items = [item.strip() for item in v if item and item.strip()]
    
    if not valid_items:
        raise ValueError(f"At least one non-empty {field_name} is required")
    
    return valid_items
