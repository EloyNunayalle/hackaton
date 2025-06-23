import boto3
import os
import json
from datetime import datetime
import traceback

def lambda_handler(event, context):
    try:
        # Log de entrada
        print(json.dumps({
            "tipo": "INFO",
            "log_datos": {
                "evento_recibido": event
            }
        }))

        # Obtener token del evento
        token = event.get('token')
        if not token:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Token no proporcionado'})
            }

        # Conectar a DynamoDB
        dynamodb = boto3.resource('dynamodb')
        table_name = os.environ["TOKEN_TABLE_NAME"]
        table = dynamodb.Table(table_name)

        # Obtener token
        response = table.get_item(
            Key={'token': token}
        )

        if 'Item' not in response:
            return {
                'statusCode': 403,
                'body': json.dumps({'error': 'Token no existe'})
            }

        registro = response['Item']
        expires_at = datetime.fromisoformat(registro['expires_at'])
        now = datetime.utcnow()

        if now > expires_at:
            return {
                'statusCode': 403,
                'body': json.dumps({'error': 'Token expirado'})
            }

        # Token válido
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Token válido',
                'tenant_id': registro['tenant_id'],
                'sort_key': registro['sort_key'],
                'expires_at': registro['expires_at']
            })
        }

    except Exception as e:
        print(json.dumps({
            "tipo": "ERROR",
            "log_datos": {
                "mensaje": "Error al validar token",
                "error": str(e),
                "evento_original": event,
                "traceback": traceback.format_exc()
            }
        }))
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }