import os

import requests

FRONTEND_URL = os.environ.get("http://localhost:3000", "http://err:3000")
BACKEND_URL = os.environ.get("http://localhost:5000", "http://err:5000")


def test_frontend():
    url = FRONTEND_URL + "/heartbeat"
    response = requests.get(url)
    assert response.status_code == 200
    assert "alive" in response.text


def test_backend():
    url = BACKEND_URL + "/heartbeat"
    response = requests.get(url)
    assert response.status_code == 200
    assert response.json().get("success") is True
    assert response.json().get("data") == "API is running"
