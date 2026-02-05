import logging
import re
from typing import List
from spellchecker import SpellChecker

logger = logging.getLogger(__name__)

class BeautifyService:
    def __init__(self):
        self.spell = SpellChecker()

    def correct_text(self, text: str) -> str:
        if not text:
            return text
            
        words = re.findall(r"[\w']+|[.,!?;]", text)
        
        corrected_words = []
        for word in words:
            if word.isalpha():
                correction = self.spell.correction(word)
                if correction and correction != word:
                    logger.info(f"Corrected '{word}' to '{correction}'")
                    corrected_words.append(correction)
                else:
                    corrected_words.append(word)
            else:
                corrected_words.append(word)
        
        result = ""
        for i, word in enumerate(corrected_words):
            if i > 0 and word not in ".,!?;":
                result += " "
            result += word
            
        return result

    def batch_correct(self, texts: List[str]) -> List[str]:
        return [self.correct_text(text) for text in texts]

beautify_service = BeautifyService()
