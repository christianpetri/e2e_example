# Java Backend API Documentation

_All endpoints are prefixed with:_ `/internal/api`

---

## Public Endpoints

### `GET /internal/api/status`

**Description:** Check if the backend is running.  
**Response:**  

```json
{ "message": "Backend is online! (Java API)" }
```

### `GET /internal/api/public-data`

**Description:** Get a public message.  
**Response:**  

```json
{ "message": "This is public data from the Java backend!" }
```

---

## Authentication

### `POST /internal/api/login`

**Description:** Login and receive a dummy JWT token.  
**Request Body:**  

```json
{ "username": "string", "password": "string" }
```

**Response (success):**  

```json
{ "message": "Login successful!", "token": "fake-jwt-token-for-java-demo" }
```

**Response (failure):**  

```json
{ "message": "Invalid credentials" }
```

**Notes:**  
Username and password are checked against the environment variables `API_USERNAME` and `API_PASSWORD` (defaults: `testuser`/`testpassword`).

---

## Protected Endpoints

### `GET /internal/api/data`

**Description:** Retrieve protected data (requires token).  
**Headers:**  
`Authorization: Bearer fake-jwt-token-for-java-demo`  
**Response (success):**  

```json
{ "message": "This is protected data from the Java backend!", "user": "testuser" }
```

**Response (unauthorized):**  

```json
{ "message": "Unauthorized: No valid token provided" }
```

---

### `POST /internal/api/resource`

**Description:** Create a protected resource (requires token).  
**Headers:**  
`Authorization: Bearer fake-jwt-token-for-java-demo`  
**Request Body:**  

```json
{
  "name": "string",
  "description": "string"
}
```

**Response (success):**  

```json
{
  "message": "Resource created successfully!",
  "resource": {
    "id": "res-<timestamp>",
    "name": "...",
    "description": "...",
    "createdBy": "testuser"
  }
}
```

**Response (unauthorized):**

```json
{ "message": "Unauthorized: No valid token provided for resource creation" }
```

---

### `GET /internal/api/probe`

**Description:** Debug endpoint, returns received headers and a timestamp.  
**Response:**  

```json
{
  "status": "probe received",
  "timestamp": 1721638858642,
  "receivedHeaders": {
    "header1": "value1",
    "header2": "value2"
  }
}
```

---

## Example `.env` values

```dotenv
API_USERNAME=testuser
API_PASSWORD=testpassword
```

---

## Usage Example (curl)

```sh
# Login and get a token
curl -X POST http://localhost:8080/internal/api/login -H "Content-Type: application/json" -d '{"username":"testuser","password":"testpassword"}'

# Access public data
curl http://localhost:8080/internal/api/public-data

# Access protected data
curl http://localhost:8080/internal/api/data -H "Authorization: Bearer fake-jwt-token-for-java-demo"

# Create a protected resource
curl -X POST http://localhost:8080/internal/api/resource -H "Authorization: Bearer fake-jwt-token-for-java-demo" -H "Content-Type: application/json" -d '{"name":"Sample","description":"Demo"}'

# Check status
curl http://localhost:8080/internal/api/status

# Probe endpoint
curl http://localhost:8080/internal/api/probe
```

---

**Notes:**

- All endpoints return JSON.
- Authentication is simulated with a dummy token for demonstration/learning purposes.
- Update `API_USERNAME` and `API_PASSWORD` via environment variables if needed.
