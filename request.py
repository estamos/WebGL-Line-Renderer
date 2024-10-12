import requests

# URL for the POST request
url = "enter_url_here"

# Data to be sent in the body of the POST request
data = {
    "career_application": {
        "name": "Your name",
        "email": "Your email",
        "role": "Role title",
        "resume_url": "A publicly accessible URL pointing to your resume",
        "notes": "Optional -- anything you'd like to say about yourself",
        "submission_url": "A publicly accessible URL pointing to your coding challenge -- see below"
    }
}

# Send the POST request
response = requests.post(url, json=data)

# Check the response
if response.status_code == 200:
    print("Application submitted successfully!")
else:
    print(f"Failed to submit application. Status code: {response.status_code}")
    print("Response:", response.text)

