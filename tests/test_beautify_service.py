"""Tests for app.services.beautify_service module."""

import pytest
from app.services.beautify_service import BeautifyService, beautify_service


class TestBeautifyService:
    """Tests for BeautifyService class."""

    @pytest.fixture
    def service(self):
        """Create a BeautifyService instance for testing."""
        return BeautifyService()

    def test_correct_text_empty_string(self, service):
        """Test that empty string returns empty string."""
        result = service.correct_text("")
        assert result == ""

    def test_correct_text_none_input(self, service):
        """Test that None input returns None."""
        result = service.correct_text(None)
        assert result is None

    def test_correct_text_already_correct(self, service):
        """Test that correct text remains unchanged."""
        text = "hello world"
        result = service.correct_text(text)
        # Words should remain unchanged
        assert "hello" in result.lower()
        assert "world" in result.lower()

    def test_correct_text_preserves_punctuation(self, service):
        """Test that punctuation is preserved."""
        text = "hello, world!"
        result = service.correct_text(text)
        assert "," in result
        assert "!" in result

    def test_correct_text_handles_numbers(self, service):
        """Test that numbers are preserved (non-alpha tokens)."""
        text = "test 123 hello"
        result = service.correct_text(text)
        assert "123" in result

    def test_correct_text_with_misspelling(self, service):
        """Test that misspellings are corrected."""
        # Using a common misspelling
        text = "teh"
        result = service.correct_text(text)
        # Should correct 'teh' to 'the'
        assert result == "the"

    def test_correct_text_preserves_capitalization_structure(self, service):
        """Test that words are processed correctly."""
        text = "hello"
        result = service.correct_text(text)
        assert result == "hello"

    def test_batch_correct_empty_list(self, service):
        """Test batch_correct with empty list."""
        result = service.batch_correct([])
        assert result == []

    def test_batch_correct_single_item(self, service):
        """Test batch_correct with single item."""
        result = service.batch_correct(["hello"])
        assert len(result) == 1
        assert result[0] == "hello"

    def test_batch_correct_multiple_items(self, service):
        """Test batch_correct with multiple items."""
        texts = ["hello", "world", "test"]
        result = service.batch_correct(texts)
        assert len(result) == 3

    def test_batch_correct_with_empty_strings(self, service):
        """Test batch_correct handles empty strings."""
        texts = ["hello", "", "world"]
        result = service.batch_correct(texts)
        assert len(result) == 3
        assert result[1] == ""

    def test_global_instance_exists(self):
        """Test that global beautify_service instance exists."""
        assert beautify_service is not None
        assert isinstance(beautify_service, BeautifyService)

    def test_service_has_spell_checker(self, service):
        """Test that service has spell checker initialized."""
        assert hasattr(service, 'spell')
        assert service.spell is not None

    def test_correct_text_multiple_sentences(self, service):
        """Test correction with multiple sentences."""
        text = "hello world. this is a test."
        result = service.correct_text(text)
        assert "." in result

    def test_correct_text_with_contractions(self, service):
        """Test that contractions are handled."""
        text = "don't"
        result = service.correct_text(text)
        # Contractions contain apostrophe which is included in word regex
        assert result  # Should return something

    def test_batch_correct_preserves_order(self, service):
        """Test that batch_correct preserves order of items."""
        texts = ["first", "second", "third"]
        result = service.batch_correct(texts)
        assert result[0] == "first"
        assert result[1] == "second"
        assert result[2] == "third"
