# Ziyaarah API Documentation

## Base URL

```
https://ziyaarah.vercel.app
```

## Authentication

All endpoints require authentication using a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

### Authentication Endpoints

#### Register User

```
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

```
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

```
GET /api/auth/me
```

Response:

- 200 OK: Returns user details
- 401 Unauthorized: Invalid or missing token
- 500 Internal Server Error: Server error

## API Endpoints

### Trips

#### List Trips

```
GET /api/trips
```

Returns a list of all trips the authenticated user is a member of.

Response:

```json
[
  {
    "id": "trip123",
    "name": "Umrah 2024",
    "start_date": "2024-03-01",
    "end_date": "2024-03-15",
    "group_code": "ZIYAA20240001",
    "created_at": 1709251200000,
    "created_by": "user123"
  }
]
```

#### Get Trip

```
GET /api/trips/[tripId]
```

Returns details of a specific trip.

Response:

```json
{
  "id": "trip123",
  "name": "Umrah 2024",
  "start_date": "2024-03-01",
  "end_date": "2024-03-15",
  "group_code": "ZIYAA20240001",
  "created_at": 1709251200000,
  "created_by": "user123"
}
```

#### Create Trip

```
POST /api/trips
```

Creates a new trip.

Request Body:

```json
{
  "name": "Umrah 2024",
  "start_date": "2024-03-01",
  "end_date": "2024-03-15"
}
```

Response: Created trip object

#### Update Trip

```
PUT /api/trips/[tripId]
```

Updates a trip's details. Only the trip owner can update.

Request Body:

```json
{
  "name": "Updated Name",
  "start_date": "2024-03-02",
  "end_date": "2024-03-16"
}
```

Response: Updated trip object

#### Delete Trip

```
DELETE /api/trips/[tripId]
```

Deletes a trip and all associated data. Only the trip owner can delete.

Response:

```json
{
  "success": true
}
```

### Trip Members

#### List Members

```
GET /api/trips/[tripId]/members
```

Returns a list of all members in a trip.

Response:

```json
[
  {
    "id": "member123",
    "trip_id": "trip123",
    "user_id": "user123",
    "role": "owner",
    "joined_at": 1709251200000,
    "user": {
      "name": "John Doe",
      "email": "john@example.com",
      "avatarUrl": "https://..."
    }
  }
]
```

#### Add Member

```
POST /api/trips/[tripId]/members
```

Adds a new member to the trip.

Request Body:

```json
{
  "memberId": "user456",
  "role": "member"
}
```

Response: Created member object

#### Remove Member

```
DELETE /api/trips/[tripId]/members?memberId=user456
```

Removes a member from the trip. Only the trip owner can remove members.

Response:

```json
{
  "success": true
}
```

### Packing Categories

#### List Categories

```
GET /api/trips/[tripId]/packing/categories
```

Returns all packing categories for a trip.

Response:

```json
[
  {
    "id": "cat123",
    "trip_id": "trip123",
    "title": "Clothing",
    "order": 1,
    "created_at": 1709251200000,
    "created_by": "user123"
  }
]
```

#### Create Category

```
POST /api/trips/[tripId]/packing/categories
```

Creates a new packing category.

Request Body:

```json
{
  "title": "Documents",
  "order": 2
}
```

Response: Created category object

#### Update Category

```
PUT /api/trips/[tripId]/packing/categories/[categoryId]
```

Updates a packing category.

Request Body:

```json
{
  "title": "Updated Title",
  "order": 3
}
```

Response: Updated category object

#### Delete Category

```
DELETE /api/trips/[tripId]/packing/categories/[categoryId]
```

Deletes a packing category and all its items.

Response:

```json
{
  "success": true
}
```

### Packing Items

#### List Items

```
GET /api/trips/[tripId]/packing/categories/[categoryId]/items
```

Returns all items in a category.

Response:

```json
[
  {
    "id": "item123",
    "category_id": "cat123",
    "name": "Ihram clothing",
    "quantity": 2,
    "essential": true,
    "packed": false,
    "created_at": 1709251200000,
    "created_by": "user123"
  }
]
```

#### Create Item

```
POST /api/trips/[tripId]/packing/categories/[categoryId]/items
```

Creates a new packing item.

Request Body:

```json
{
  "name": "Sunscreen",
  "quantity": 1,
  "essential": true
}
```

Response: Created item object

#### Update Item

```
PUT /api/trips/[tripId]/packing/categories/[categoryId]/items/[itemId]
```

Updates a packing item.

Request Body:

```json
{
  "name": "Updated Name",
  "quantity": 2,
  "essential": false
}
```

Response: Updated item object

#### Toggle Item Packed Status

```
PUT /api/trips/[tripId]/packing/categories/[categoryId]/items/[itemId]/toggle
```

Toggles the packed status of an item.

Request Body:

```json
{
  "packed": true
}
```

Response: Updated item object

#### Delete Item

```
DELETE /api/trips/[tripId]/packing/categories/[categoryId]/items/[itemId]
```

Deletes a packing item.

Response:

```json
{
  "success": true
}
```

### Packing Progress

#### Get Progress

```
GET /api/trips/[tripId]/packing/progress
```

Returns packing progress summary.

Response:

```json
{
  "total_items": 10,
  "packed_items": 4,
  "percentage": 40,
  "by_category": [
    {
      "category": "Documents",
      "packed": 2,
      "total": 2
    },
    {
      "category": "Clothing",
      "packed": 0,
      "total": 3
    }
  ]
}
```

### Rituals

#### Get All Trips with Rituals

```
GET /api/trips/with-rituals
```

Returns all trips for the current user along with their rituals and ritual steps.

Response:

```json
[
  {
    "_id": "trip123",
    "name": "Umrah Trip",
    "start_date": "2024-01-01",
    "end_date": "2024-01-10",
    "created_at": 1709251200000,
    "created_by": "user123",
    "group_code": "ABC123",
    "rituals": [
      {
        "ritual": {
          "_id": "ritual123",
          "trip_id": "trip123",
          "title": "Umrah Rituals",
          "description": "Steps for performing Umrah",
          "order": 1,
          "created_at": 1709251200000,
          "created_by": "user123"
        },
        "steps": [
          {
            "_id": "step123",
            "ritual_id": "ritual123",
            "title": "Enter Ihram",
            "type": "action",
            "completed": false,
            "order": 1,
            "created_at": 1709251200000,
            "created_by": "user123"
          }
        ]
      }
    ]
  }
]
```

#### List Rituals

```
GET /api/trips/[tripId]/rituals
```

Returns all rituals for a trip.

Response:

```json
[
  {
    "id": "ritual123",
    "trip_id": "trip123",
    "title": "Umrah Rituals",
    "description": "Steps for performing Umrah",
    "order": 1,
    "created_at": 1709251200000,
    "created_by": "user123"
  }
]
```

#### Create Ritual

```
POST /api/trips/[tripId]/rituals
```

Creates a new ritual.

Request Body:

```json
{
  "title": "Hajj Rituals",
  "description": "Steps for performing Hajj",
  "order": 2
}
```

Response: Created ritual object

### Ritual Steps

#### List Steps

```
GET /api/trips/[tripId]/rituals/steps?ritualId=ritual123
```

Returns all steps for a ritual.

Response:

```json
[
  {
    "id": "step123",
    "ritual_id": "ritual123",
    "title": "Enter Ihram",
    "type": "action",
    "completed": false,
    "order": 1,
    "created_at": 1709251200000,
    "created_by": "user123"
  }
]
```

#### Create Step

```
POST /api/trips/[tripId]/rituals/steps?ritualId=ritual123
```

Creates a new ritual step.

Request Body:

```json
{
  "title": "Perform Tawaf",
  "type": "action",
  "order": 2
}
```

Response: Created step object

#### Update Step Completion

```
PUT /api/trips/[tripId]/rituals/steps
```

Updates a step's completion status.

Request Body:

```json
{
  "stepId": "step123",
  "completed": true
}
```

Response: Updated step object

#### Delete Step

```
DELETE /api/trips/[tripId]/rituals/steps
```

Deletes a ritual step.

Request Body:

```json
{
  "stepId": "step123"
}
```

Response:

```json
{
  "success": true
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "error": "Not authorized to perform this action"
}
```

### 404 Not Found

```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Failed to perform operation"
}
```

## Common Error Messages

- "Trip not found"
- "Not a member of this trip"
- "Only trip owner can perform this action"
- "Category not found"
- "Item not found"
- "Ritual not found"
- "Step not found"
- "Missing required fields"
- "Not authorized"
