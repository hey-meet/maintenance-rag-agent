# backend/tests/test_encoding.py
import unittest
import codecs

class TestFileEncodings(unittest.TestCase):
    def test_docs_encoding_is_pure_utf8(self):
        """Ensures the documentation file does not contain a BOM or invalid codecs."""
        file_path = "docs/validation_strategy.md"
        with open(file_path, "rb") as f:
            raw_bytes = f.read(4)
        
        # Check for UTF-8 BOM, UTF-16 BOMs which break GitHub's rich diff rendering
        self.assertNotEqual(raw_bytes[:3], b'\xef\xbb\xbf', "File contains UTF-8 BOM!")
        self.assertNotEqual(raw_bytes[:2], b'\xff\xfe', "File is UTF-16 LE!")
        self.assertNotEqual(raw_bytes[:2], b'\xfe\xff', "File is UTF-16 BE!")

if __name__ == "__main__":
    unittest.main()