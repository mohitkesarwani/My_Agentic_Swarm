#!/bin/bash
# Example script for creating a project via the API
# Usage: ./create-project.sh <token> "Project Name" "Project Description"

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API URL
API_URL="${API_URL:-http://localhost:3001}"

# Check arguments
if [ $# -lt 2 ]; then
    echo -e "${RED}Error: Missing required arguments${NC}"
    echo "Usage: $0 <token> <project-name> [description]"
    echo "Example: $0 \"\$(cat token.txt)\" \"My First Project\" \"Testing the platform\""
    echo ""
    echo "Or read token from file:"
    echo "$0 \"\$(cat token.txt)\" \"My Project\""
    exit 1
fi

TOKEN="$1"
PROJECT_NAME="$2"
DESCRIPTION="${3:-No description provided}"

echo -e "${YELLOW}Creating project...${NC}"
echo "Project Name: $PROJECT_NAME"
echo "Description: $DESCRIPTION"
echo "API URL: $API_URL"
echo ""

# Make the API call
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/v1/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\":\"$PROJECT_NAME\",\"description\":\"$DESCRIPTION\"}")

# Extract HTTP status code and response body
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✓ Project created successfully!${NC}"
    echo ""
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    # Extract and save project ID
    PROJECT_ID=$(echo "$BODY" | jq -r '.data.id' 2>/dev/null)
    if [ -n "$PROJECT_ID" ] && [ "$PROJECT_ID" != "null" ]; then
        echo ""
        echo -e "${YELLOW}To use this project ID in subsequent requests:${NC}"
        echo "export PROJECT_ID=\"$PROJECT_ID\""
        echo ""
        echo "Or save to file:"
        echo "echo \"$PROJECT_ID\" > project-id.txt"
        
        # Save to file automatically
        echo "$PROJECT_ID" > project-id.txt
        echo -e "${GREEN}✓ Project ID saved to project-id.txt${NC}"
    fi
else
    echo -e "${RED}✗ Project creation failed (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    exit 1
fi
