import re

env_path = '/root/appwrite/.env'
with open(env_path, 'r') as f:
    content = f.read()

updates = {
    '_APP_SMTP_HOST': 'smtp.hostinger.com',
    '_APP_SMTP_PORT': '465',
    '_APP_SMTP_SECURE': 'ssl',
    '_APP_SMTP_USERNAME': 'help@tranzlo.net',
    '_APP_SMTP_PASSWORD': 'Cdromlg@8442',
    '_APP_SYSTEM_EMAIL_ADDRESS': 'support@tranzlo.net',
    '_APP_SYSTEM_EMAIL_NAME': 'Tranzlo Support'
}

for key, val in updates.items():
    pattern = rf'^{key}=.*$'
    replacement = f'{key}="{val}"'
    if re.search(pattern, content, re.MULTILINE):
        content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
    else:
        content += f'\n{replacement}\n'

with open(env_path, 'w') as f:
    f.write(content)

print("Appwrite .env updated successfully")
