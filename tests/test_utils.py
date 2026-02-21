"""Tests for app.api.utils module."""

import pytest
from app.api.utils import validate_non_empty_list


class TestValidateNonEmptyList:
    """Tests for validate_non_empty_list function."""

    def test_valid_list_with_single_item(self):
        """Test with a list containing a single valid string."""
        result = validate_non_empty_list(["hello"], "item")
        assert result == ["hello"]

    def test_valid_list_with_multiple_items(self):
        """Test with a list containing multiple valid strings."""
        result = validate_non_empty_list(["a", "b", "c"], "item")
        assert result == ["a", "b", "c"]

    def test_strips_whitespace_from_items(self):
        """Test that whitespace is stripped from items."""
        result = validate_non_empty_list(["  hello  ", "  world  "], "item")
        assert result == ["hello", "world"]

    def test_filters_empty_strings(self):
        """Test that empty strings are filtered out."""
        result = validate_non_empty_list(["valid", "", "another"], "item")
        assert result == ["valid", "another"]

    def test_filters_whitespace_only_strings(self):
        """Test that whitespace-only strings are filtered out."""
        result = validate_non_empty_list(["valid", "   ", "another"], "item")
        assert result == ["valid", "another"]

    def test_raises_on_empty_list(self):
        """Test that empty list raises ValueError."""
        with pytest.raises(ValueError) as exc_info:
            validate_non_empty_list([], "url")
        assert "At least one url is required" in str(exc_info.value)

    def test_raises_on_all_empty_strings(self):
        """Test that list with all empty strings raises ValueError."""
        with pytest.raises(ValueError) as exc_info:
            validate_non_empty_list(["", "", ""], "query")
        assert "At least one non-empty query is required" in str(exc_info.value)

    def test_raises_on_all_whitespace_strings(self):
        """Test that list with all whitespace strings raises ValueError."""
        with pytest.raises(ValueError) as exc_info:
            validate_non_empty_list(["   ", "\t", "\n"], "field")
        assert "At least one non-empty field is required" in str(exc_info.value)

    def test_filters_none_items(self):
        """Test that None items are filtered out."""
        result = validate_non_empty_list(["valid", None, "another"], "item")
        assert result == ["valid", "another"]

    def test_mixed_valid_and_invalid_items(self):
        """Test with a mix of valid and invalid items."""
        result = validate_non_empty_list(
            ["  valid  ", "", None, "   ", "another", ""],
            "item"
        )
        assert result == ["valid", "another"]

    def test_custom_field_name_in_error_message(self):
        """Test that custom field name appears in error message."""
        with pytest.raises(ValueError) as exc_info:
            validate_non_empty_list([], "custom_field_name")
        assert "custom_field_name" in str(exc_info.value)
