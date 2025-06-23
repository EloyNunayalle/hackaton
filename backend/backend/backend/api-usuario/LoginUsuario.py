import boto3
import hashlib
import uuid
import os
import json
from datetime import datetime, timedelta
import traceback

# Hashear contraseña
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Función auxiliar para retornar respuestas con soporte CORS
def cors_response(status_code, body_dict):
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*'
        },
        'body': json.dumps(body_dict)
    }

def lambda_handler(event, context):
    try:
        # Log de entrada
        print(json.dumps({
            "tipo": "INFO",
            "log_datos": {
                "evento_recibido": event
            }
        }))

        # Si el body es string, convertir a dict
        body = event.get('body')
        if isinstance(body, str):
            body = json.loads(body)

        # Obtener email y password
        email = body.get('email')
        password = body.get('password')

        if not email or not password:
            return cors_response(400, {'error': 'Faltan email o password'})

        tenant_id = email.lower()
        sort_key = "usuario#" + email.lower()
        hashed_input = hash_password(password)

        # Obtener nombre de la tabla desde variable de entorno
        nombre_tabla = os.environ["TABLE_NAME"]
        tabla = boto3.resource('dynamodb').Table(nombre_tabla)

        # Buscar usuario
        response = tabla.get_item(
            Key={
                'tenant_id': tenant_id,
                'sort_key': sort_key
            }
        )

        if 'Item' not in response:
            return cors_response(403, {'error': 'Usuario no existe'})

        usuario = response['Item']
        hashed_guardado = usuario['password']

        if hashed_input != hashed_guardado:
            return cors_response(403, {'error': 'Password incorrecto'})

        # Generar token y expiración
        token = str(uuid.uuid4())
        fecha_exp = datetime.utcnow() + timedelta(minutes=60)
        registro_token = {
            'token': token,
            'tenant_id': tenant_id,
            'sort_key': sort_key,
            'expires_at': fecha_exp.isoformat()
        }

        # Guardar token
        tabla_tokens = boto3.resource('dynamodb').Table(os.environ["TOKEN_TABLE_NAME"])
        tabla_tokens.put_item(Item=registro_token)

        print(json.dumps({
            "tipo": "INFO",
            "log_datos": {
                "token_generado": registro_token
            }
        }))

        return cors_response(200, {
            'token': token,
            'expires_at': registro_token['expires_at']
        })

    except Exception as e:
        print(json.dumps({
            "tipo": "ERROR",
            "log_datos": {
                "mensaje": "Error en login",
                "error": str(e),
                "traceback": traceback.format_exc(),
                "evento_original": event
            }
        }))
        return cors_response(500, {'error': str(e)})
