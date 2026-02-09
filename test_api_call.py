import requests
import json

url = "https://functions.poehali.dev/35a9b8c7-7661-4f0a-9832-9dc67c299145"

payload = {
    "username": "nekit654",
    "password": "nekit654nekit654",
    "delete_username": "danil654"
}

try:
    response = requests.post(url, json=payload)
    
    print(f"Status Code: {response.status_code}")
    print(f"\nResponse Headers:")
    for key, value in response.headers.items():
        print(f"  {key}: {value}")
    
    print(f"\nResponse Body:")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)
        
except Exception as e:
    print(f"Error: {str(e)}")
