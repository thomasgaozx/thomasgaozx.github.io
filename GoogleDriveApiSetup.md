# Setting Up Google Drive Api Python Client Library on a Debian Linux Machine

## Install pip/pip3
Run `sudo apt-get install pip` (and later in the script use `#!/usr/bin/python`).

Alternatively, run `sudo apt-get install pip3` (and later in the script use `#!/usr/bin/python3`)

## Install Google Api Client Library and OAuth 2 Client
Run `pip install --upgrade google-api-python-client oauth2client`.

## Enable Google Drive Api and Run Test Script
[Enable the Drive Api and Download the Sample Script](https://developers.google.com/drive/api/v3/quickstart/python).

Run the script on the linux machine and you should be expecting a one-time authentication, and a list of drive files printed out on the console.

These are preliminary steps to ensure a working client library.

# Uploading Any Files to Google Drive

