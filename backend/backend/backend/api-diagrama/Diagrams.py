import os
import uuid
import boto3
import glob
import json
from datetime import datetime

# 🟡 CORS helper
def cors_response(status_code, body_dict):
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        'body': json.dumps(body_dict)
    }

def lambda_handler(event, context):
    try:
        print(f"Event received: {json.dumps(event, default=str)}")

        # Leer variables de entorno
        bucket_name = os.environ['S3_BUCKET_NAME']
        validate_lambda_name = os.environ['VALIDATE_TOKEN_LAMBDA_NAME']

        # Validar token desde header
        headers = event.get("headers", {})
        token = headers.get("Authorization")
        if not token:
            return cors_response(401, {"error": "No se proporcionó el token en el header Authorization"})

        lambda_client = boto3.client('lambda')
        response = lambda_client.invoke(
            FunctionName=validate_lambda_name,
            InvocationType='RequestResponse',
            Payload=json.dumps({"token": token})
        )

        result = json.loads(response['Payload'].read())
        if result.get("statusCode") != 200:
            return cors_response(result.get("statusCode", 403), json.loads(result.get("body", "{}")))

        auth_data = json.loads(result['body'])
        tenant_id = auth_data['tenant_id']

        # Cargar el cuerpo de la solicitud
        body = event.get("body", "{}")
        body = json.loads(body) if isinstance(body, str) else body
        code = body.get("code", "")

        if not code:
            return cors_response(400, {"error": "No se proporcionó código para ejecutar"})

        # Limpiar imágenes anteriores
        for f in glob.glob("/tmp/*.png"):
            os.remove(f)

        # Ejecutar el código de diagrams
        exec_globals = {"__builtins__": __builtins__}
        exec(code, exec_globals)

        # Buscar el archivo generado en /tmp
        files = glob.glob("/tmp/*.png")
        if not files:
            raise FileNotFoundError("No se generó ningún archivo PNG en /tmp")

        output_file = files[0]
        file_name = os.path.basename(output_file)

        # Crear key en S3 con estructura: {tenant_id}/Diagrams/{timestamp}_{uuid}.png
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        unique_name = f"{timestamp}_{uuid.uuid4().hex}.png"
        s3_key = f"{tenant_id}/Diagrams/{unique_name}"

        s3 = boto3.client("s3")
        s3.upload_file(
            output_file,
            bucket_name,
            s3_key,
            ExtraArgs={"ContentType": "image/png",
                      "ACL": "public-read"  # 👈 esto permite acceso público
            }
            
        )

        file_url = f"https://{bucket_name}.s3.amazonaws.com/{s3_key}"

        return cors_response(200, {
            "success": True,
            "tenant_id": tenant_id,
            "file_url": file_url,
            "s3_key": s3_key,
            "saved_at": timestamp
        })

    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return cors_response(500, {
            "success": False,
            "error": str(e),
            "message": "Error interno del servidor"
        })
