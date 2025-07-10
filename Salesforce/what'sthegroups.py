from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# Assuming you have the credentials and token set up
creds = Credentials.from_authorized_user_file('token.json')
service = build('people', 'v1', credentials=creds)

# Now call the contactGroups.list method
groups_request = service.contactGroups().list()
groups_response = groups_request.execute()

# The response contains a list of contact groups
for group in groups_response.get('contactGroups', []):
    print(f"Group name: {group.get('name')} - Resource name: {group.get('resourceName')}")
