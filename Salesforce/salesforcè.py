import re
import pyperclip
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import os
import json

# Path to your client_secret.json
CLIENT_SECRET_FILE = r'C:\Users\vince\OneDrive - Vincent Lüders\Codes\Python\client_secret_690596961690-n9qjvbl0oio47e6q8mfkrp8oeipe3uqc.apps.googleusercontent.com.json'
SCOPES = ['https://www.googleapis.com/auth/contacts']
TOKEN_FILE = 'token.json'


# Function to extract contact information from the text
def extract_contact_info(text):
    
    # Regular expressions to match the fields
    name_pattern = r'Name\s+(?:M(?:r|rs|s)\.?\s+)?([\w\s\'\-\.]+?)(?=(Other Phone|Company Name))'
    phone_pattern = r'Phone\s+((?:\+\d+)?(?:\s*\d+)+)'
    email_pattern = r'Email\s*([\w\.-]+@[\w\.-]+)'
    company_pattern = r'Company Name\s+(.+?)(?=\s+Title)'
    title_pattern = r'Title\s+([\w\s\&\.\-]+)(?=\(.*?\)|Phone|Department|Email)'
    

    # Extracting data
    name_match = re.search(name_pattern, text, re.DOTALL)
    phone_match = re.search(phone_pattern, text, re.DOTALL)
    email_match = re.search(email_pattern, text, re.DOTALL)
    company_match = re.search(company_pattern, text, re.DOTALL)
    title_match = re.search(title_pattern, text, re.DOTALL)

    # Ensure all required parts were found
    if not all([name_match, phone_match, email_match, company_match, title_match]):
        missing_parts = ['name', 'phone', 'email', 'company', 'title']
        found_parts = [match is not None for match in [name_match, phone_match, email_match, company_match, title_match]]
        missing_parts = [part for found, part in zip(found_parts, missing_parts) if not found]
        raise ValueError(f"Could not parse the following parts of the contact information: {', '.join(missing_parts)}")

    # Extracted data
    name = name_match.group(1).strip()
    phone = phone_match.group(1).strip()
    email = email_match.group(1).strip()
    company = company_match.group(1).strip()
    title = title_match.group(1).strip()

    # Ensure phone number has the correct country code prefix
    if phone.startswith('352') and not phone.startswith('+352'):
        phone = f'+{phone}'
    
    # Create the payload for the contact information
    contact_info = {
        'names': [{'givenName': name}],
        'phoneNumbers': [{'value': phone}],
        'emailAddresses': [{'value': email}],
        'organizations': [{'name': company, 'title': title, 'type': 'work', 'current': True}],
        'memberships': [{'contactGroupMembership': {'contactGroupResourceName': 'contactGroups/135d34e10d621f27'}}]
    }
    
    return contact_info


# Function to create contact using Google People API
def create_contact(contact_info):
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                CLIENT_SECRET_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())

    service = build('people', 'v1', credentials=creds)
    service.people().createContact(body=contact_info).execute()

# Get the latest content from the clipboard
text = pyperclip.paste()

# Extract contact information from the clipboard content
contact_info = extract_contact_info(text)

# Create a contact with the extracted information
create_contact(contact_info)
