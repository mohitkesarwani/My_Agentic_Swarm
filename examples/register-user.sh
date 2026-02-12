#!/bin/bash
# Example script for registering a user via the API
# Usage: ./register-user.sh "John Doe" "john@example.com" "SecurePass123!"

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API URL
API_URL="${API_URL:-http://localhost:3001}"

# Check arguments
if [ $# -ne 3 ]; then
    echo -e "${RED}Error: Missing required arguments${NC}"
    echo "Usage: $0 <name> <email> <password>"
    echo "Example: $0 \"John Doe\" \"john@example.com\" \"SecurePass123!\""
    exit 1
fi

NAME="$1"
EMAIL="$2"
PASSWORD="$3"

# Validate email format (basic check)
if [[ ! "$EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo -e "${RED}Error: Invalid email format${NC}"
    exit 1
fi

# Validate password length
if [ ${#PASSWORD} -lt 8 ]; then
    echo -e "${RED}Error: Password must be at least 8 characters${NC}"
    exit 1
fi

echo -e "${YELLOW}Registering user...${NC}"
echo "Name: $NAME"
echo "Email: $EMAIL"
echo "API URL: $API_URL"
echo ""

# Make the API call
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$NAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

# Extract HTTP status code and response body
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✓ User registered successfully!${NC}"
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
    fi
else
    echo -e "${RED}✗ Registration failed (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    exit 1
fi
