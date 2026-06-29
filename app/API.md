# API Documentation

This API is built with NestJS. Most write routes return Nest's default `201 Created` for `POST` requests, while `GET` and `DELETE` routes return `200 OK` unless an exception is thrown.

## Authentication Model

Authentication is cookie based.

Successful login and registration create a signed JWT session token and store it in an HTTP-only cookie named `session_id`.

Cookie options:

- `httpOnly: true`
- `secure: true` only in production
- `sameSite: strict` when setting the cookie
- `path: /`
- `maxAge: 3600000` milliseconds

Protected routes use `CookieAuthGuard`. Some routes also call `AuthService.getSecuredEmail(request)` directly to read and verify the `session_id` cookie.

## Response Shapes

Authenticated user responses use this shape:

```json
{
  "id": "54b6af70-8af5-4f3d-bd44-e68f66e91cf7",
  "email": "user@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "files": [],
  "picture": ""
}
```

User DTO responses use this shape:

```json
{
  "id": "54b6af70-8af5-4f3d-bd44-e68f66e91cf7",
  "email": "user@example.com"
}
```

File DTO responses use this shape:

```json
{
  "id": "54b6af70-8af5-4f3d-bd44-e68f66e91cf7",
  "name": "notes.txt",
  "uploadDate": "2026-06-24T10:00:00.123Z",
  "expirationDate": "2026-07-01T10:00:00.000Z",
  "hasExpired": false,
  "tags": [
    {
      "id": "a8408d60-44ac-4948-9bc0-1d62c462ee84",
      "name": "Project"
    }
  ],
  "hasPassword": false,
  "link": "generated-link"
}
```

Tag DTO responses use this shape:

```json
{
  "id": "a8408d60-44ac-4948-9bc0-1d62c462ee84",
  "name": "Project"
}
```

## Auth Routes

### `POST /auth/login`

Authenticates an existing user and sets the `session_id` cookie.

Request body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Validation:

- `email` must be a valid email address.
- `password` must be a non-empty string.

Response:

- Returns the authenticated user response.
- Sets the `session_id` cookie.

### `POST /auth/register`

Creates a new user account and signs the user in.

Request body:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "passwordConfirmation": "password123",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

Validation:

- `email` must be a valid email address.
- `password` must be a non-empty string.
- `passwordConfirmation` must be a non-empty string.
- `firstName` must be a non-empty string.
- `lastName` must be a non-empty string.

Response:

- Returns the authenticated user response.
- Sets the `session_id` cookie.

## User Routes

### `GET /user/health`

Requires `session_id`.

Checks the database connection.

Response:

```json
{
  "connected": true,
  "message": "Successfully connected to the database"
}
```

### `GET /user/by-email?email=user@example.com`

Requires `session_id`.

Finds a user by email and returns a user DTO.

Query parameters:

- `email`: user email address.

### `GET /user/by-id?id=54b6af70-8af5-4f3d-bd44-e68f66e91cf7`

Requires `session_id`.

Finds a user by id and returns a user DTO.

Query parameters:

- `id`: user id.

### `GET /user/all`

Requires `session_id`.

Returns all users as user DTOs.

### `POST /user/login`

Alternative login route that uses the same session behavior as `POST /auth/login`.

Request body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

- Returns the authenticated user response.
- Sets the `session_id` cookie.

### `POST /user/logout`

Clears the `session_id` cookie.

Response:

```json
{
  "message": "Logged out successfully, cookie cleared"
}
```

## File Routes

### `POST /file/upload`

Requires `session_id`.

Uploads a multipart file for the authenticated user. The owner email is read from the secured cookie, not from the request body.

Request format: `multipart/form-data`

Fields:

- `file`: uploaded file content. Required. The field name must be `file`.
- `name`: display name. Required non-empty string.
- `extension`: file extension. Required string.
- `expirationTimeInDay`: number of days before expiration. Required.
- `password`: optional file password.
- `uploadDate`: optional ISO date string.
- `tags`: optional tag input.

Upload validation:

- The uploaded file is required.
- Files must be smaller than `1073741824` bytes.
- The uploaded file name and `extension` field reject dangerous extensions such as `.exe`, `.bat`, `.cmd`, `.js`, `.ps1`, `.sh`, `.vbs`, and other executable/script formats.
- Extra non-whitelisted body fields are rejected by the file validation pipe.

Response:

- Returns all files when creation succeeds.
- Returns an empty array when creation returns `false`.

### `GET /file/files`

Reads and verifies the `session_id` cookie with `AuthService.getSecuredEmail(request)`.

Returns files belonging to the authenticated user email.

Response:

```json
[
  {
    "id": "54b6af70-8af5-4f3d-bd44-e68f66e91cf7",
    "name": "notes.txt",
    "uploadDate": "2026-06-24T10:00:00.123Z",
    "expirationDate": "2026-07-01T10:00:00.000Z",
    "hasExpired": false,
    "tags": [],
    "hasPassword": false,
    "link": "generated-link"
  }
]
```

### `POST /file/download`

Requires `session_id`.

Downloads a file by id. If the file is password protected, the password must match.

Request body:

```json
{
  "id": "54b6af70-8af5-4f3d-bd44-e68f66e91cf7",
  "password": "optional-file-password"
}
```

Validation:

- `id` must be a UUID.
- `password` is optional and must be a string when provided.

Response:

- Streams the raw file content.

### `POST /file/download/anonymous`

Downloads a file by id without `CookieAuthGuard`.

Request body:

```json
{
  "id": "54b6af70-8af5-4f3d-bd44-e68f66e91cf7",
  "password": "optional-file-password"
}
```

Response:

- Streams the raw file content.

### `GET /file/link/:link`

Requires `session_id`.

Resolves a generated file link back to a file id and returns the matching file DTO.

Path parameters:

- `link`: generated file link.

### `DELETE /file/delete/:id`

Requires `session_id`.

Deletes a file by id.

Path parameters:

- `id`: file id.

Response:

```json
{
  "deleted": true
}
```

## Tag Routes

All tag routes require `session_id` through `CookieAuthGuard`.

### `POST /tag/add`

Creates a tag.

Request body:

```json
{
  "name": "Project"
}
```

Validation:

- `name` must be a non-empty string.
- `name` must be at most 255 characters.

Response:

- Returns the created tag DTO.

### `GET /tag/all`

Returns all tags.

Response:

```json
[
  {
    "id": "a8408d60-44ac-4948-9bc0-1d62c462ee84",
    "name": "Project"
  }
]
```

### `DELETE /tag/delete`

Deletes a tag by id.

Request body:

```json
{
  "id": "a8408d60-44ac-4948-9bc0-1d62c462ee84"
}
```

Validation:

- `id` must be a UUID.

Response:

```json
{
  "deleted": true
}
```

## Common Error Behavior

The controllers and validation pipes throw standard NestJS HTTP exceptions.

Common cases:

- `400 Bad Request`: invalid DTO payload, invalid UUID, missing multipart file, forbidden file extension, or oversized upload.
- `401 Unauthorized`: missing, invalid, or expired authentication cookie on protected routes.
- `404 Not Found`: requested user, file, or tag does not exist.
- `409 Conflict`: duplicate tag names or already-used registration email.

## Main Data Flow

1. A user registers or logs in through `/auth/*` or `/user/login`.
2. The API sets the `session_id` cookie.
3. Protected routes verify the cookie with `CookieAuthGuard` or `AuthService.getSecuredEmail`.
4. File upload validates the multipart request and derives the owner from the session cookie.
5. The service layer stores file metadata, writes file content, applies tags, and returns file DTOs.
