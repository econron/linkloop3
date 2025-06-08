aws dynamodb scan \
  --table-name PronunciationRawResults \
  --endpoint-url http://localhost:8000 | jq .