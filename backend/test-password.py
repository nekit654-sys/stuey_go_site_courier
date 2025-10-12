import bcrypt

# Пароль который ты помнишь
password = "admin654654"

# Хеши из базы данных
hash_nekit = "$2b$12$Wm06YGEmScvBtXifB0fezuwK3lUJrsDatP7goMTeUn98I3rbqZVs2"
hash_danil = "$2b$12$oFtEsq4CEgCi2HN4ZsPf0O59pzVtHbv5zPzKDQz/GA2W1U2MVmE.q"

print("Проверка пароля 'admin654654':")
print(f"nekit654: {bcrypt.checkpw(password.encode('utf-8'), hash_nekit.encode('utf-8'))}")
print(f"danil654: {bcrypt.checkpw(password.encode('utf-8'), hash_danil.encode('utf-8'))}")

# Создаем правильный хеш
correct_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
print(f"\nПравильный хеш для 'admin654654': {correct_hash}")
