import json
import base64
import boto3
import uuid
import os
from datetime import datetime

def process_mermaid_code(code):
    processed_code = code.replace('\\n', '\n')
    lines = [line.strip() for line in processed_code.split('\n') if line.strip()]
    return '\n'.join(lines)

def save_to_s3(bucket_name, tenant_id, diagram_data):
    try:
        s3 = boto3.client('s3')
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        s3_key = f"{tenant_id}/Mermaid/{timestamp}.json"

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

        bucket_name = os.environ['S3_BUCKET_NAME']
        validate_lambda_name = os.environ['VALIDATE_TOKEN_LAMBDA_NAME']

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

        body = event.get("body")
        if body is None:
            code = event.get("code")
        elif isinstance(body, str):
            try:
                parsed_body = json.loads(body)
                code = parsed_body.get("code")
            except:
                code = body
        else:
            code = body.get("code")

        if not code:
            return cors_response(400, {"error": "No se proporcionó código Mermaid"})

        processed_code = process_mermaid_code(code)
        encoded = base64.urlsafe_b64encode(processed_code.encode('utf-8')).decode('ascii').rstrip('=')

        base_url = "https://mermaid.ink"
        urls = {
            "img": f"{base_url}/img/{encoded}",
            "pdf": f"{base_url}/pdf/{encoded}",
            "svg": f"{base_url}/svg/{encoded}"
        }

        diagram_data = {
            "tenant_id": tenant_id,
            "timestamp": datetime.utcnow().isoformat(),
            "original_code": code,
            "processed_code": processed_code,
            "encoded": encoded,
            "urls": urls
        }

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
