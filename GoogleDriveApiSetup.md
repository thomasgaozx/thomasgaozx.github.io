# Setting Up Google Drive Api Python Client Library on a Debian Linux Machine

## Overview
Below are essentailly all you need to create a working google drive project:
* **google-api-python-client** python package
* **oauth2client** python package
* **credentials.json** or **client_secret.json** (same thing)

## Preliminary Step: Install pip/pip3
`sudo apt-get install pip` (and later in the script use `#!/usr/bin/python`).

Alternatively, `sudo apt-get install pip3` (and later in the script use `#!/usr/bin/python3`)

## Step 1: Install Google Api Client Library and OAuth 2 Client
`pip install --upgrade google-api-python-client oauth2client`.

## Step 2: Enable Google Drive Api and Run Test Script
[Enable the Drive Api and Download the Sample Script](https://developers.google.com/drive/api/v3/quickstart/python). By now you should be getting a _credential.json_ file (or _client_secret.json_, they have the exact same content, just different names);
Run the script on the linux machine and you should be expecting a one-time authentication, and a list of drive files printed out on the console.

# Uploading Any Files to Google Drive

Get the sample python script from this [blog](http://wescpy.blogspot.com/2015/12/migrating-to-new-google-drive-api-v3.html).

The below script should be enough for uploading (referring from the blog)
```python
#!/usr/bin/env python

# importing modules
from __future__ import print_function
import os

from apiclient import discovery
from httplib2 import Http
from oauth2client import file, client, tools

# auto-authentication
SCOPES = 'https://www.googleapis.com/auth/drive'
store = file.Storage('storage.json')
creds = store.get()
if not creds or creds.invalid:
    flow = client.flow_from_clientsecrets('client_secret.json', SCOPES)
    creds = tools.run_flow(flow, store)
DRIVE = discovery.build('drive', 'v3', http=creds.authorize(Http()))

# prepare a tuple of file name and drive format (None if you don't care)
FILES = (
    ('FileName1.mp4', None),
    ('FileName2.txt', 'application/vnd.google-apps.document'),
)

# uploading the files
for filename, mimeType in FILES:
    metadata = {'name': filename}
    if mimeType:
        metadata['mimeType'] = mimeType
    res = DRIVE.files().create(body=metadata, media_body=filename).execute()
    if res:
        print('Uploaded "%s" (%s)' % (filename, res['mimeType']))
```

You might be getting an error telling you that _client_secret.json_ doesn't exists. You can just replace the `'client_secret.json'` from the code with `'credential.json'`. This is the json that tells Google endpoint that you are a permitted user of its API. 

One way to obtain the json file: go to Developer Console, create project, and find a way to create client id. Once you created client id, you should find a button somewhere that says '_Download Json_'. Click that button, and '_client_secretxxxxxxx.json_' should be downloaded.

The first time you run the script, you may be required to authenticate again for more drive permission (e.g. read-write permission). You may also notice on the console that there is some warning about a file called '_Storage.json_'. Don't worry about it, it is just the file where your authentication token is stored so that you won't be prompted to authenticate again.

From the above script, change the file names in the tuple, and now you should be expecting the files to appear on your drive!
