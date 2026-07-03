import os
import sys
import unittest
from fastapi.testclient import TestClient

# Ensure python paths are mapped correctly
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.main import app
from backend.app.utils import estimate_tokens, get_code_prompt, get_completion_prompt
from backend.app.config import settings

class TestBackendUtilities(unittest.TestCase):
    def test_token_estimation(self):
        # Verify basic estimation boundaries
        self.assertEqual(estimate_tokens(""), 0)
        
        sample_text = "def hello_world():\n    print('Hello World')"
        tokens = estimate_tokens(sample_text)
        self.assertGreater(tokens, 0)
        self.assertLess(tokens, len(sample_text))

    def test_prompt_constructors(self):
        # Test code prompt builder
        prompt = get_code_prompt("explain", "print(10)", "python")
        self.assertIn("print(10)", prompt)
        self.assertIn("explain", prompt.lower())

        # Test code completion prompt builder
        completion_prompt = get_completion_prompt("def add(a, b):", "return a + b", "python")
        self.assertIn("def add(a, b):", completion_prompt)
        self.assertIn("return a + b", completion_prompt)

class TestAPIEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_check(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("active_mode", data)

    def test_metrics_endpoints(self):
        response = self.client.get("/metrics")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total_requests", data)
        self.assertIn("average_latency_seconds", data)

    def test_model_info(self):
        response = self.client.get("/model-info")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("model_name", data)
        self.assertIn("inference_mode", data)
        self.assertIn("device", data)

if __name__ == "__main__":
    unittest.main()
