#!/bin/bash
# Example script for logging in via the API
# Usage: ./login-user.sh "john@example.com" "SecurePass123!"

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API URL
API_URL="${API_URL:-http://localhost:3001}"

# Check arguments
if [ $# -ne 2 ]; then
    echo -e "${RED}Error: Missing required arguments${NC}"
    echo "Usage: $0 <email> <password>"
    echo "Example: $0 \"john@example.com\" \"SecurePass123!\""
    exit 1
fi

EMAIL="$1"
PASSWORD="$2"

echo -e "${YELLOW}Logging in...${NC}"
echo "Email: $EMAIL"
echo "API URL: $API_URL"
echo ""

# Make the API call
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

# Extract HTTP status code and response body
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Login successful!${NC}"
    echo ""
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    # Extract and save token
    TOKEN=$(echo "$BODY" | jq -r '.data.token' 2>/dev/null)
    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        echo ""
        echo -e "${YELLOW}To use this token in subsequent requests:${NC}"
        echo "export TOKEN=\"$TOKEN\""
        echo ""
        echo "Or save to file:"
        echo "echo \"$TOKEN\" > token.txt"
        
        # Save to file automatically
        echo "$TOKEN" > token.txt
        echo -e "${GREEN}✓ Token saved to token.txt${NC}"
    fi
else
    echo -e "${RED}✗ Login failed (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    exit 1
fi
