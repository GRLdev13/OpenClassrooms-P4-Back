
## Authentication Model

Authentication is cookie based.

When a user logs in or registers successfully, the API creates a signed JWT session token and stores it in an HTTP-only cookie named `session_id`.

Protected routes use `CookieAuthGuard`, which reads the `session_id` cookie and asks `AuthService` to verify the session.

## Main Endpoints

### Register

`POST /auth/register`

Creates a new user account and immediately signs the user in.

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

Main behavior:

- Rejects mismatched password and password confirmation.
- Rejects an email that is already used.
- Rejects passwords shorter than 8 characters.
- Hashes the password before saving the user.
- Returns connected user data.
- Sets the `session_id` authentication cookie.

### Login

`POST /auth/login`

Authenticates an existing user and creates a session cookie.

Request body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Main behavior:

- Finds the user by email.
- Compares the submitted password with the stored password hash.
- Returns connected user data when credentials are valid.
- Sets the `session_id` authentication cookie.
- Rejects invalid credentials.

### Upload File

`POST /file/upload`

Uploads a file for an authenticated user. This endpoint requires a valid `session_id` cookie.

Request format: `multipart/form-data`

Fields:

- `file`: uploaded file content, required.
- `name`: file display name.
- `extension`: file extension.
- `email`: owner user email.
- `expirationTimeInDay`: number of days before expiration.
- `password`: optional file password.
- `uploadDate`: optional upload date.
- `tags`: optional tags.

Main behavior:

- Requires authentication through `CookieAuthGuard`.
- Rejects missing uploaded files.
- Rejects dangerous file extensions through `FileValidator`.
- Converts the uploaded file buffer to base64 before passing it to `FileService`.
- Finds the owner user by email.
- Stores the file content in PostgreSQL as binary data.
- Optionally hashes a file password.
- Calculates an expiration date.
- Generates a shareable file link.
- Links the uploaded file to the owner user.
- Adds or reuses tags, then links them to the file.
- Returns the current list of files when creation succeeds.

## Other File Endpoints

- `POST /file`: returns files for a user email.
- `POST /file/download`: downloads a file by id, with optional file password.
- `GET /file/link/:link`: resolves a generated link and returns file metadata.
- `DELETE /file/delete/:id`: deletes a file by id.

## Data Flow Summary

1. A user registers or logs in.
2. The API sets a `session_id` cookie.
3. The frontend sends that cookie on protected file requests.
4. The upload endpoint validates the request and passes file data to the service layer.
5. The service layer stores the file, links it to the user, applies tags, and returns file metadata.