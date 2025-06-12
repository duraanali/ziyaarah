# Ziyaarah API

A RESTful API for managing Umrah and Hajj trips. This API provides endpoints for creating and managing trips, handling trip members, tracking checkpoints, and managing packing lists.

## Base URL

```
https://ziyaarah.vercel.app
```

## Authentication

All API endpoints require authentication using a JWT token in the Authorization header:

```
Authorization: Bearer your-token-here
```

## API Endpoints

### Authentication

#### Register User

```http
POST /api/auth/register
```

Request Body:

```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

Response:

- 200 OK: User registered successfully
- 400 Bad Request: Missing required fields
- 409 Conflict: Email already exists
- 500 Internal Server Error: Server error

#### Login User

```http
POST /api/auth/login
```

Request Body:

```json
{
  "email": "string",
  "password": "string"
}
```

Response:

- 200 OK: Returns JWT token
- 400 Bad Request: Missing credentials
- 401 Unauthorized: Invalid credentials
- 500 Internal Server Error: Server error

#### Get Current User

```http
GET /api/auth/me
```

Response:

- 200 OK: Returns user details
- 401 Unauthorized: Invalid or missing token
- 500 Internal Server Error: Server error

### Trips

#### Create Trip

```http
POST /api/trips
```

Request Body:

```json
{
  "name": "string",
  "start_date": "string (YYYY-MM-DD)",
  "end_date": "string (YYYY-MM-DD)"
}
```

Response:

- 201 Created: Returns created trip
- 400 Bad Request: Missing required fields
- 401 Unauthorized: Invalid token
- 500 Internal Server Error: Server error

#### Get All Trips

```http
GET /api/trips
```

Response:

- 200 OK: Returns array of trips
- 401 Unauthorized: Invalid token
- 500 Internal Server Error: Server error

#### Get Trip by ID

```http
GET /api/trips/:id
```

Response:

- 200 OK: Returns trip details
- 404 Not Found: Trip not found
- 401 Unauthorized: Invalid token
- 500 Internal Server Error: Server error

#### Update Trip

```http
PUT /api/trips/:id
```

Request Body:

```json
{
  "name": "string (optional)",
  "start_date": "string (YYYY-MM-DD) (optional)",
  "end_date": "string (YYYY-MM-DD) (optional)",
  "group_code": "string (optional)"
}
```

Response:

- 200 OK: Returns updated trip
- 400 Bad Request: Invalid input
- 401 Unauthorized: Invalid token
- 403 Forbidden: Not trip owner
- 404 Not Found: Trip not found
- 500 Internal Server Error: Server error

#### Delete Trip

```http
DELETE /api/trips/:id
```

Response:

- 200 OK: Trip deleted successfully
- 401 Unauthorized: Invalid token
- 403 Forbidden: Not trip owner
- 404 Not Found: Trip not found
- 500 Internal Server Error: Server error

#### Join Trip

```http
POST /api/trips/join
```

Request Body:

```json
{
  "group_code": "string"
}
```

Response:

- 200 OK: Returns trip details
- 400 Bad Request: Invalid group code
- 401 Unauthorized: Invalid token
- 500 Internal Server Error: Server error

#### Get Trip Members

```http
GET /api/trips/:id/members
```

Response:

- 200 OK: Returns array of members
- 401 Unauthorized: Invalid token
- 404 Not Found: Trip not found
- 500 Internal Server Error: Server error

### Checkpoints

#### Create Checkpoint

```http
POST /api/trips/:id/checkpoints
```

Request Body:

```json
{
  "title": "string",
  "type": "string",
  "description": "string (optional)"
}
```

Response:

- 201 Created: Returns created checkpoint
- 400 Bad Request: Missing required fields
- 401 Unauthorized: Invalid token
- 403 Forbidden: Not trip member
- 404 Not Found: Trip not found
- 500 Internal Server Error: Server error

#### Toggle Checkpoint Completion

```http
PUT /api/checkpoints/:id/complete
```

Request Body:

```json
{
  "completed": "boolean"
}
```

Response:

- 200 OK: Returns updated checkpoint
- 400 Bad Request: Invalid input
- 401 Unauthorized: Invalid token
- 403 Forbidden: Not trip member
- 404 Not Found: Checkpoint not found
- 500 Internal Server Error: Server error

### Packing Items

#### Add Packing Item

```http
POST /api/trips/:id/packing
```

Request Body:

```json
{
  "name": "string",
  "note": "string (optional)"
}
```

Response:

- 201 Created: Returns created item
- 400 Bad Request: Missing required fields
- 401 Unauthorized: Invalid token
- 403 Forbidden: Not trip member
- 404 Not Found: Trip not found
- 500 Internal Server Error: Server error

#### Toggle Item Check Status

```http
PUT /api/packing/:id/check
```

Request Body:

```json
{
  "checked": "boolean"
}
```

Response:

- 200 OK: Returns updated item
- 400 Bad Request: Invalid input
- 401 Unauthorized: Invalid token
- 403 Forbidden: Not trip member
- 404 Not Found: Item not found
- 500 Internal Server Error: Server error

#### Delete Packing Item

```http
DELETE /api/packing/:id
```

Response:

- 200 OK: Item deleted successfully
- 401 Unauthorized: Invalid token
- 403 Forbidden: Not trip member
- 404 Not Found: Item not found
- 500 Internal Server Error: Server error

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

Common HTTP Status Codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting

The API implements rate limiting to ensure fair usage. Rate limits are:

- 100 requests per minute per IP address
- 1000 requests per hour per IP address

## Support

For support or questions, please open an issue in the GitHub repository.
