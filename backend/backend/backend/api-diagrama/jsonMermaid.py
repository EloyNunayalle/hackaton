import json
import base64
import boto3
import os
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

def save_to_s3(bucket_name, tenant_id, diagram_data):
    try:
        s3 = boto3.client('s3')
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        s3_key = f"{tenant_id}/jsonMermaid/{timestamp}.json"

        s3.put_object(
            Bucket=bucket_name,
            Key=s3_key,
            Body=json.dumps(diagram_data, indent=2),
            ContentType='application/json'
        )

        print(f"Diagram saved to S3 at: {s3_key}")
        return {
            "s3_key": s3_key,
            "saved_at": timestamp
        }

    except Exception as e:
        print(f"Error saving to S3: {e}")
        raise e

def lambda_handler(event, context):
    try:
        print(f"Event received: {json.dumps(event, default=str)}")

        # Variables de entorno
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

        # Leer el cuerpo
        body = event.get("body", "{}")
        json_input = json.loads(body) if isinstance(body, str) else body

        nodes = json_input.get("nodes", [])
        edges = json_input.get("edges", [])

        # Generar código Mermaid
        mermaid_lines = ["graph TD"]
        if not edges:
            mermaid_lines.append("    %% No edges to display")
        else:
            for edge in edges:
                src = edge.get("from")
                dst = edge.get("to")
                if src and dst:
                    mermaid_lines.append(f"    {src} --> {dst}")

        mermaid_code = "\n".join(mermaid_lines)

        # Codificar en base64 URL-safe
        encoded = base64.urlsafe_b64encode(mermaid_code.encode("utf-8")).decode("ascii").rstrip("=")

        # URLs para renderizado remoto
        base_url = "https://mermaid.ink"
        urls = {
            "png": f"{base_url}/img/{encoded}",
            "pdf": f"{base_url}/pdf/{encoded}",
            "svg": f"{base_url}/svg/{encoded}"
        }

        # Preparar datos para guardar
        diagram_data = {
            "tenant_id": tenant_id,
            "timestamp": datetime.utcnow().isoformat(),
            "nodes": nodes,
            "edges": edges,
            "mermaid_code": mermaid_code,
            "encoded": encoded,
            "urls": urls
        }

        # Guardar en S3
        s3_result = save_to_s3(bucket_name, tenant_id, diagram_data)

        return cors_response(200, {
            "success": True,
            "urls": urls,
            "encoded": encoded,
            "s3_info": s3_result,
            "tenant_id": tenant_id
        })

    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return cors_response(500, {
            "success": False,
            "error": str(e),
            "message": "Error interno del servidor"
        })
