# Jest Tests

This project uses Jest to test the main API behaviors that are most important for users: login, registration, and file upload.

## Login

Login is tested in `src/auth/auth.controller.spec.ts`.

The test checks that `POST /auth/login`:

- Accepts an email and password.
- Calls `AuthService.signIn` with the submitted credentials.
- Returns the connected user data.
- Sets the authentication cookie named `session_id`.

Why this matters:

Login is the entry point for existing users. The test makes sure the route creates a usable authenticated session and returns the expected user payload.

## Register

Registration is tested in `src/auth/auth.controller.spec.ts` and `src/auth/auth.service.spec.ts`.

The route test checks that `POST /auth/register`:

- Accepts email, password, password confirmation, first name, and last name.
- Calls `AuthService.create` with the submitted values.
- Returns the connected user data.
- Sets the authentication cookie named `session_id`.

The service tests check that registration:

- Rejects mismatched password confirmation.
- Rejects an email that already exists.
- Hashes passwords so the raw password is not stored.

Why this matters:

Registration creates new accounts and immediately signs users in. The tests protect the account creation flow and basic password safety rules.

## Upload File

File upload is tested in `src/file/file.controller.spec.ts` and `src/file/file.service.spec.ts`.

The route tests check that `POST /file/upload`:

- Accepts a multipart upload with a file field.
- Converts the uploaded file buffer to base64 before calling the service.
- Returns the list of files when creation succeeds.
- Rejects requests without a file.
- Rejects unauthenticated requests.
- Rejects forbidden file extensions.
- Returns an empty list if file creation returns false.

The service tests check that upload creation:

- Rejects missing file content.
- Rejects missing user email.
- Finds the owner user by email.
- Saves the file inside a transaction.
- Generates a file link.
- Links the file to the user.
- Hashes optional file passwords.
- Normalizes tags and avoids duplicate tag links.
- Calculates expiration dates.
- Rejects invalid upload dates.

Why this matters:

File upload is the core feature of the API. These tests cover the request shape, authentication requirement, validation rules, storage preparation, password protection, tagging, and expiration behavior.

## Coverage Configuration

DTO files are ignored during coverage calculation because they mostly contain request or response shapes and do not hold meaningful business logic.

The Jest configuration excludes them with:

```json
"collectCoverageFrom": [
  "**/*.(t|j)s",
  "!**/*.dto.ts"
]
```
