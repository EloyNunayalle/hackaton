import boto3
import hashlib
import os
import json
from datetime import datetime
import traceback

# Hashear contraseña
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Función auxiliar para retornar respuestas con soporte CORS
def cors_response(status_code, body_dict):
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',  # <- CORS habilitado para todos
            'Access-Control-Allow-Headers': '*'
        },
        'body': json.dumps(body_dict)
    }

# Lambda handler
def lambda_handler(event, context):
    try:
        # Log de entrada
        print(json.dumps({
            "tipo": "INFO",
            "log_datos": {
                "evento_recibido": event
            }
        }))

        # Si el body es string , lo convertimos a dict
        body = event.get('body')
        if isinstance(body, str):
            body = json.loads(body)

        # Obtener datos del cuerpo
        email = body.get('email')
        password = body.get('password')
        nombre = body.get('nombre')
        apellido = body.get('apellido')
        edad = body.get('edad')

        # Validación básica
        if not email or not password:
            return cors_response(400, {
                'error': 'Faltan campos obligatorios: email o password'
            })

        # tenant_id será el email, sort_key generado aleatoriamente
        tenant_id = email.lower()
        sort_key = "usuario#" + email.lower()

        # Hashear contraseña
        hashed_password = hash_password(password)

        # Obtener nombre de la tabla desde variables de entorno
        nombre_tabla = os.environ["TABLE_NAME"]

        # Preparar item a insertar
        item = {
            'tenant_id': tenant_id,
            'sort_key': sort_key,
            'password': hashed_password,
            'nombre': nombre,
            'apellido': apellido,
            'edad': int(edad) if edad else None,
            'fecha_registro': datetime.utcnow().isoformat()
        }

        # Eliminar claves con valor None
        item = {k: v for k, v in item.items() if v is not None}

        # Conectar con DynamoDB e insertar
        dynamodb = boto3.resource('dynamodb')
        tabla = dynamodb.Table(nombre_tabla)
        response = tabla.put_item(Item=item)

        # Log de salida
        print(json.dumps({
            "tipo": "INFO",
            "log_datos": {
                "usuario_insertado": item,
                "resultado_dynamodb": response.get("ResponseMetadata", {})
            }
        }))

        return cors_response(200, {
            'message': 'Usuario registrado correctamente',
            'tenant_id': tenant_id,
            'sort_key': sort_key
        })

    except Exception as e:
        print(json.dumps({
            "tipo": "ERROR",
            "log_datos": {
                "mensaje": "Error en el registro del usuario",
                "error": str(e),
                "evento_original": event,
                "traceback": traceback.format_exc()
            }
        }))
        return cors_response(500, {'error': str(e)})