#!/bin/bash

# Use the App URL from the environment or default to localhost
URL=${APP_URL:-"http://localhost:3000"}

echo "--- Race Condition Test ---"

# 1. Create a new request
echo "Step 1: Creating a fresh request..."
CREATE_RESPONSE=$(curl -s -X POST "$URL/requests" \
     -H "Content-Type: application/json" \
     -d '{
       "clientName": "Race Test Client",
       "phone": "555-RACE",
       "address": "123 Speed Way",
       "problemText": "Concurrency test"
     }')

# Extract ID using grep/sed
REQUEST_ID=$(echo $CREATE_RESPONSE | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

if [ -z "$REQUEST_ID" ]; then
    echo "Failed to create request. Response: $CREATE_RESPONSE"
    exit 1
fi

echo "Created Request ID: $REQUEST_ID"

# 2. Assign the request to a master
echo "Step 2: Setting request $REQUEST_ID to 'assigned' status..."
curl -s -X POST "$URL/requests/$REQUEST_ID/assign" \
     -H "Content-Type: application/json" \
     -d '{"masterId": 1}' > /dev/null

# 3. Fire two parallel requests
echo "Step 3: Firing two parallel 'take' requests..."

# Fire requests in background and capture status codes
(curl -s -o /dev/null -w "Request A Result: %{http_code}\n" -X POST "$URL/requests/$REQUEST_ID/take") &
(curl -s -o /dev/null -w "Request B Result: %{http_code}\n" -X POST "$URL/requests/$REQUEST_ID/take") &

# Wait for background processes
wait

echo "---------------------------"
echo "Expected: One 200 (Success) and one 409 (Conflict)."
