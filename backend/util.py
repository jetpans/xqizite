from flask import session, jsonify
from functools import wraps
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, \
    unset_jwt_cookies, jwt_required, JWTManager, verify_jwt_in_request, decode_token


# Make enum for ChatRoomType
class EChatRoomType:
    DEFAULT = 0
    FAST = 1


def get_user_from_jwt(jwt):
    payload = decode_token(jwt)
    user = payload.get("sub")
    return user


def verify_jwt(jwt):
    try:
        payload = decode_token(jwt)
    except:
        raise ValueError("Invalid JWT token")
