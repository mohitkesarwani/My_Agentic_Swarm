# Example Scripts for Agentic Swarm Platform

This directory contains helper scripts for common operations during onboarding and development.

## Prerequisites

- **curl**: For making HTTP requests
- **jq**: For parsing JSON responses (optional, but recommended)
- **API running**: Ensure the API server is running at `http://localhost:3001`

Install jq on various platforms:
```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq

# Fedora/RHEL
sudo dnf install jq
```

## Scripts

### 1. Register User (`register-user.sh`)

Register a new user account.

**Usage:**
```bash
./examples/register-user.sh "John Doe" "john@example.com" "SecurePass123!"
```

**Output:**
- Creates a new user
- Returns JWT token
- Saves token to `token.txt` (optional)

**Example:**
```bash
$ ./examples/register-user.sh "Jane Smith" "jane@example.com" "MyPassword123"
✓ User registered successfully!

Response:
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### 2. Login User (`login-user.sh`)

Login with existing credentials.

**Usage:**
```bash
./examples/login-user.sh "john@example.com" "SecurePass123!"
```

**Output:**
- Returns JWT token
- Automatically saves token to `token.txt`

**Example:**
```bash
$ ./examples/login-user.sh "jane@example.com" "MyPassword123"
✓ Login successful!
✓ Token saved to token.txt
```

---

### 3. Create Project (`create-project.sh`)

Create a new project for organizing build requests.

**Usage:**
```bash
./examples/create-project.sh "$(cat token.txt)" "My Project" "Optional description"
```

**Output:**
- Creates a new project
- Returns project details
- Automatically saves project ID to `project-id.txt`

**Example:**
```bash
$ ./examples/create-project.sh "$(cat token.txt)" "Todo App" "A simple todo application"
✓ Project created successfully!
✓ Project ID saved to project-id.txt
```

---

### 4. Submit Build Request (`submit-build.sh`)

Submit a build request to the orchestrator.

**Usage:**
```bash
./examples/submit-build.sh "$(cat token.txt)" "$(cat project-id.txt)" "Create a REST API for managing todos"
```

**Output:**
- Submits build request
- Returns build request ID
- Automatically saves build ID to `build-id.txt`

**Example:**
```bash
$ ./examples/submit-build.sh "$(cat token.txt)" "$(cat project-id.txt)" \
  "Create a simple REST API with endpoints for creating, listing, updating, and deleting todos"
✓ Build request submitted successfully!
✓ Build ID saved to build-id.txt
```

---

### 5. Check Build Status (`check-build-status.sh`)

Check the status of a submitted build request.

**Usage:**
```bash
./examples/check-build-status.sh "$(cat token.txt)" "$(cat project-id.txt)" "$(cat build-id.txt)"
```

**Output:**
- Shows current build status (PENDING, RUNNING, COMPLETED, FAILED)
- Shows staging path when completed
- Shows error message if failed

**Example:**
```bash
$ ./examples/check-build-status.sh "$(cat token.txt)" "$(cat project-id.txt)" "$(cat build-id.txt)"
✓ Build Status: COMPLETED

Generated code location:
solutions/users/507f1f77bcf86cd799439011/projects/507f1f77bcf86cd799439012/builds/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

## Complete Workflow Example

Here's a complete example showing the full onboarding flow:

```bash
# 1. Start services
docker compose -f infrastructure/docker/docker-compose.yml up -d

# 2. Wait for services to be ready
sleep 10

# 3. Register a new user
./examples/register-user.sh "John Doe" "john@example.com" "SecurePass123!"

# 4. Login (token saved to token.txt)
./examples/login-user.sh "john@example.com" "SecurePass123!"

# 5. Create a project (project ID saved to project-id.txt)
./examples/create-project.sh "$(cat token.txt)" "My First Project" "Testing the platform"

# 6. Submit a build request (build ID saved to build-id.txt)
./examples/submit-build.sh "$(cat token.txt)" "$(cat project-id.txt)" \
  "Create a simple todo list API with CRUD operations"

# 7. Check build status
./examples/check-build-status.sh "$(cat token.txt)" "$(cat project-id.txt)" "$(cat build-id.txt)"

# 8. Keep checking until completed (wait 30 seconds between checks)
while [ "$(./examples/check-build-status.sh "$(cat token.txt)" "$(cat project-id.txt)" "$(cat build-id.txt)" 2>/dev/null | grep -o 'completed\|failed' | head -1)" == "" ]; do
  echo "Build still in progress..."
  sleep 30
done

echo "Build finished!"
```

---

## Environment Variables

All scripts respect the following environment variables:

- **API_URL**: API base URL (default: `http://localhost:3001`)

**Example:**
```bash
API_URL=http://api.example.com:3001 ./examples/register-user.sh "John" "john@example.com" "password"
```

---

## File Outputs

Scripts automatically save important values to files for convenience:

| File | Content | Created By |
|------|---------|------------|
| `token.txt` | JWT authentication token | `login-user.sh`, `register-user.sh` |
| `project-id.txt` | Project ID | `create-project.sh` |
| `build-id.txt` | Build request ID | `submit-build.sh` |

These files are gitignored and safe to use locally.

---

## Troubleshooting

### Script fails with "command not found: jq"

**Solution:** Install jq (see Prerequisites above) or the script will fall back to raw JSON output.

### Script fails with "Connection refused"

**Solution:** Ensure the API server is running:
```bash
curl http://localhost:3001/health
```

### Invalid token errors

**Solution:** Login again to get a fresh token:
```bash
./examples/login-user.sh "your@email.com" "yourpassword"
```

### Permission denied when running scripts

**Solution:** Make scripts executable:
```bash
chmod +x examples/*.sh
```

---

## Additional Resources

- **Full Onboarding Guide**: See [ONBOARDING.md](../ONBOARDING.md) for detailed instructions
- **API Documentation**: Check `docs/api/` for complete API reference
- **Repository README**: See [README.md](../README.md) for architecture overview
