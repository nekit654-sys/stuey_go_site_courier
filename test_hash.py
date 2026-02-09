import bcrypt

password = "admin123"
password_bytes = password.encode('utf-8')
salt = bcrypt.gensalt(rounds=12)
hashed = bcrypt.hashpw(password_bytes, salt)

print(f"Password: {password}")
print(f"Hash: {hashed.decode('utf-8')}")

# Проверим что работает
check = bcrypt.checkpw(password_bytes, hashed)
print(f"Verification: {check}")
