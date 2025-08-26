from jwcrypto import jwk, jwe
import base64
import json
import os
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from api.models import User

def get_encryption_key(secret, salt):
    salt_bytes = salt.encode("utf-8")
    info_string = f"Auth.js Generated Encryption Key ({salt})".encode("utf-8")
 
    hkdf = HKDF(algorithm=hashes.SHA256(), length=64, salt=salt_bytes, info=info_string)
    key = hkdf.derive(secret.encode("utf-8"))
    
    
    if len(key)!= 64:
        raise ValueError('Key length incorrect')
    return key

def decode_authjs_session(token):
    authjs_secret = os.environ.get('AUTH_SECRET')
    authjs_salt = os.environ.get('AUTHJS_SALT')

    if not authjs_secret:
        raise ValueError("AUTHJS_SECRET environment variable is not set.")
    if not authjs_salt:
        raise ValueError("AUTHJS_SALT environment variable is not set.")
    
    key_bytes = get_encryption_key(authjs_secret, authjs_salt)
    print('the keybytes are', key_bytes)
    key = jwk.JWK(kty='oct', k=base64.urlsafe_b64encode(key_bytes).decode('utf-8'))
    print('the key is', key)
    try:
        jwe_token = jwe.JWE()
        jwe_token.deserialize(token)
        jwe_token.decrypt(key)
        data = jwe_token.payload
        decoded_token = json.loads(data.decode("utf-8"))
        return decoded_token
    except Exception as e:
        print(f"Error wihle decrypting, {e}" )
        raise e

class AuthenticateJWE(BaseAuthentication):
    def authenticate(self, request):
        auth = request.headers.get("Authorization", "")
        token = auth.removeprefix("Bearer ").strip()
        try:
            payload = decode_authjs_session(token)
        except Exception as e:
            print(e)
        
        user = User.objects.get(email=payload['email'], id=payload['id'])
        return (user,payload)