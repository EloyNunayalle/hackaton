import json
import boto3
import os
from collections import defaultdict

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
        s3 = boto3.client("s3")
        paginator = s3.get_paginator("list_objects_v2")

        # Diccionario jerárquico por email → carpeta → archivos
        structured = defaultdict(lambda: defaultdict(list))

        for page in paginator.paginate(Bucket=bucket_name):
            for obj in page.get("Contents", []):
                key = obj["Key"]
                parts = key.split("/", 2)

                if len(parts) < 3:
                    continue  # saltar archivos que no tienen estructura email/carpeta/archivo

                email, carpeta, filename = parts
                url = f"https://{bucket_name}.s3.amazonaws.com/{key}"

                structured[email][carpeta].append({
                    "key": key,
                    "url": url,
                    "size": obj["Size"],
                    "last_modified": obj["LastModified"].isoformat()
                })

        return cors_response(200, {
            "success": True,
            "bucket": bucket_name,
            "files": structured
        })

    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return cors_response(500, {
            "success": False,
            "error": str(e),
            "message": "Error interno del servidor"
        })
