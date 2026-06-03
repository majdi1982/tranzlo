import os

filepath = "/root/appwrite/.env"
if os.path.exists(filepath):
    content = open(filepath).read()
    target = '_APP_FUNCTIONS_RUNTIMES="node-16.0,php-8.0,python-3.9,ruby-3.0"'
    replacement = '_APP_FUNCTIONS_RUNTIMES="node-16.0,node-18.0,node-20.0,php-8.0,python-3.9,ruby-3.0"'
    if target in content:
        content = content.replace(target, replacement)
        open(filepath, "w").write(content)
        print("Successfully updated Appwrite .env runtimes.")
    else:
        print("Target line not found or already updated.")
else:
    print("Appwrite .env not found.")
