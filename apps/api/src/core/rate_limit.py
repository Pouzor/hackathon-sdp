from slowapi import Limiter
from slowapi.util import get_remote_address

# Instance partagée — importée par main.py (app.state.limiter) et les routers
limiter = Limiter(key_func=get_remote_address)
