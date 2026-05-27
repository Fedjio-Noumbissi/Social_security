import bcrypt
hash = b"$2a$10$vCXMwTW7g3Z1h68.y9N7e.O0oJpI4C3/lPqZleHw2L59xU.yVjU.2"
print("password:", bcrypt.checkpw(b"password", hash))
print("password123:", bcrypt.checkpw(b"password123", hash))
