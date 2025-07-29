from flask import session, jsonify
from functools import wraps
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, \
                               unset_jwt_cookies, jwt_required, JWTManager, verify_jwt_in_request

def getRole(auth_users):

    try:
        return auth_users[session["sID"]].roleId
    except:
        return None
            
    
def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            try:
                verify_jwt_in_request(optional=True)
                claims = get_jwt()
                if claims["roleId"] in [-1]:
                    return fn(*args, **kwargs)
                else:
                    return {"success": False, "data": "Authentication required"}
            except Exception as e:
                # Handle the scenario when JWT is not present or any other exception
                return {"success": False, "data": "Authentication required"}
        return decorator

    return wrapper

def visitor_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            try:
                verify_jwt_in_request(optional=True)
                claims = get_jwt()
                if claims["roleId"] in [1,-1,0]:
                    return fn(*args, **kwargs)
                else:
                    return {"success": False, "data": f"Authentication required {claims['roleId']}"}
            except Exception as e:
                # Handle the scenario when JWT is not present or any other exception
                return {"success": False, "data": f"Authentication required. Exception. {str(e)}"}
        return decorator

    return wrapper

def organiser_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            try:
                verify_jwt_in_request(optional=True)
                claims = get_jwt()
                if claims["roleId"] in [1, -1]:
                    return fn(*args, **kwargs)
                else:
                    return {"success": False, "data": "Authentication required"}
            except Exception as e:
                # Handle the scenario when JWT is not present or any other exception
                return {"success": False, "data": "Authentication required"}
        return decorator

    return wrapper


