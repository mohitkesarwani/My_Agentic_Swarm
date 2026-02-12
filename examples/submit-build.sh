#!/bin/bash
# Example script for submitting a build request via the API
# Usage: ./submit-build.sh <token> <project-id> "Build prompt describing your feature"

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API URL
API_URL="${API_URL:-http://localhost:3001}"

# Check arguments
if [ $# -lt 3 ]; then
    echo -e "${RED}Error: Missing required arguments${NC}"
    echo "Usage: $0 <token> <project-id> <prompt>"
    echo "Example: $0 \"\$(cat token.txt)\" \"\$(cat project-id.txt)\" \"Create a REST API for managing todos\""
    exit 1
fi

TOKEN="$1"
PROJECT_ID="$2"
PROMPT="$3"

# Validate prompt length
if [ ${#PROMPT} -gt 2000 ]; then
    echo -e "${RED}Error: Prompt must be 2000 characters or less${NC}"
    exit 1
fi

echo -e "${YELLOW}Submitting build request...${NC}"
echo "Project ID: $PROJECT_ID"
echo "Prompt: $PROMPT"
echo "API URL: $API_URL"
echo ""

# Make the API call
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/v1/projects/$PROJECT_ID/build" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"prompt\":\"$PROMPT\"}")

# Extract HTTP status code and response body
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 202 ]; then
    echo -e "${GREEN}✓ Build request submitted successfully!${NC}"
    echo ""
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    # Extract and save build ID
    BUILD_ID=$(echo "$BODY" | jq -r '.data.buildRequestId' 2>/dev/null)
    if [ -n "$BUILD_ID" ] && [ "$BUILD_ID" != "null" ]; then
        echo ""
        echo -e "${YELLOW}To check build status:${NC}"
        echo "curl -H \"Authorization: Bearer \$TOKEN\" \\"
        echo "  \"$API_URL/v1/projects/$PROJECT_ID/builds/$BUILD_ID\""
        echo ""
        echo "Or use the check-build-status.sh script:"
        echo "./examples/check-build-status.sh \"\$(cat token.txt)\" \"$PROJECT_ID\" \"$BUILD_ID\""
        
        # Save build ID to file
        echo "$BUILD_ID" > build-id.txt
        echo -e "${GREEN}✓ Build ID saved to build-id.txt${NC}"
    fi
else
    echo -e "${RED}✗ Build submission failed (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    exit 1
fi
