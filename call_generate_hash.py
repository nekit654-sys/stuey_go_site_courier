import requests
import json

url = "https://functions.poehali.dev/367a9d53-4bd8-4e2c-94b2-0b1d114df77a"
payload = {
    "password": "12345678"
}

response = requests.post(url, json=payload)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code == 200:
    data = response.json()
    print(f"\nGenerated Hash: {data.get('hash')}")
