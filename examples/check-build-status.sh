#!/bin/bash
# Example script for checking build status via the API
# Usage: ./check-build-status.sh <token> <project-id> <build-id>

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API URL
API_URL="${API_URL:-http://localhost:3001}"

# Check arguments
if [ $# -lt 3 ]; then
    echo -e "${RED}Error: Missing required arguments${NC}"
    echo "Usage: $0 <token> <project-id> <build-id>"
    echo "Example: $0 \"\$(cat token.txt)\" \"\$(cat project-id.txt)\" \"\$(cat build-id.txt)\""
    exit 1
fi

TOKEN="$1"
PROJECT_ID="$2"
BUILD_ID="$3"

echo -e "${YELLOW}Checking build status...${NC}"
echo "Project ID: $PROJECT_ID"
echo "Build ID: $BUILD_ID"
echo "API URL: $API_URL"
echo ""

# Make the API call
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/v1/projects/$PROJECT_ID/builds/$BUILD_ID" \
  -H "Authorization: Bearer $TOKEN")

# Extract HTTP status code and response body
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    # Extract status
    STATUS=$(echo "$BODY" | jq -r '.data.status' 2>/dev/null)
    
    # Display with color based on status
    case "$STATUS" in
        "pending")
            echo -e "${YELLOW}⏳ Build Status: PENDING${NC}"
            ;;
        "running")
            echo -e "${BLUE}⚙️  Build Status: RUNNING${NC}"
            ;;
        "completed")
            echo -e "${GREEN}✓ Build Status: COMPLETED${NC}"
            ;;
        "failed")
            echo -e "${RED}✗ Build Status: FAILED${NC}"
            ;;
        *)
            echo -e "Build Status: $STATUS"
            ;;
    esac
    
    echo ""
    echo "Full Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    
    # Show staging path if completed
    STAGING_PATH=$(echo "$BODY" | jq -r '.data.stagingPath' 2>/dev/null)
    if [ -n "$STAGING_PATH" ] && [ "$STAGING_PATH" != "null" ]; then
        echo ""
        echo -e "${GREEN}Generated code location:${NC}"
        echo "$STAGING_PATH"
    fi
    
    # Show error if failed
    ERROR=$(echo "$BODY" | jq -r '.data.error' 2>/dev/null)
    if [ -n "$ERROR" ] && [ "$ERROR" != "null" ]; then
        echo ""
        echo -e "${RED}Error:${NC}"
        echo "$ERROR"
    fi
else
    echo -e "${RED}✗ Failed to check build status (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    exit 1
fi
