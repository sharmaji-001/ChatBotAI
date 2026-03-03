import boto3

client = boto3.client("bedrock-agent-runtime", region_name="us-east-1")

try:
    response = client.retrieve_and_generate(
        input={"text": "What services do you offer?"},
        retrieveAndGenerateConfiguration={
            "type": "KNOWLEDGE_BASE",
            "knowledgeBaseConfiguration": {
                "knowledgeBaseId": "RF2DTARKMP",
                "modelArn": "arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-lite-v1:0",
            }
        }
    )
    print("✅ SUCCESS:", response["output"]["text"][:200])
except Exception as e:
    print("❌ ERROR:", type(e).__name__, str(e))