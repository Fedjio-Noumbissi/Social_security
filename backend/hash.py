import bcrypt
# Using $2b$ and converting to $2a$ for older Spring compat just in case
h = bcrypt.hashpw(b"password123", bcrypt.gensalt(10))
print(h.decode('utf-8').replace('$2b$', '$2a$'))
