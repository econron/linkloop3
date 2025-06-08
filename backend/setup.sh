#!/bin/bash
set -e

# 1. docker-composeでDynamoDB Localを起動（永続化用ボリュームをローカルにマウント）
echo "[1/3] Launching DynamoDB Local via docker-compose..."
docker-compose up -d

# 2. テーブル作成（存在しない場合のみ）
echo "[2/3] Creating DynamoDB table if not exists..."
export AWS_ACCESS_KEY_ID=dummy
export AWS_SECRET_ACCESS_KEY=dummy
export AWS_REGION=ap-northeast-1
export DYNAMODB_ENDPOINT=http://localhost:8000

table_exists=$(aws dynamodb list-tables --endpoint-url $DYNAMODB_ENDPOINT | grep PronunciationRawResults || true)
if [ -z "$table_exists" ]; then
  aws dynamodb create-table \
    --table-name PronunciationRawResults \
    --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=timestamp,AttributeType=S \
    --key-schema AttributeName=userId,KeyType=HASH AttributeName=timestamp,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
    --endpoint-url $DYNAMODB_ENDPOINT \
    --region $AWS_REGION
  echo "Table PronunciationRawResults created."
else
  echo "Table PronunciationRawResults already exists."
fi

echo "[3/3] DynamoDB Local setup complete." 