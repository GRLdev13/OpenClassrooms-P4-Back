# Jest Tests

This project uses Jest and Supertest to cover the main API behavior for authentication, users, files, and tags. Controller tests exercise the HTTP routes with mocked services, while service tests focus on business rules, validation, repository calls, and error handling.

## Authentication

Authentication routes are tested in `src/auth/auth.controller.spec.ts`.

The route tests check that:

- `POST /auth/login` accepts credentials, calls `AuthService.signIn`, returns the authenticated user payload, and sets the `session_id` cookie.
- `POST /auth/register` accepts account details, calls `AuthService.create`, returns the authenticated user payload, and sets the `session_id` cookie.

Authentication service behavior is tested in `src/auth/auth.service.spec.ts`.

The service tests check that:

- Passwords are hashed and can be verified without storing the raw password.
- File links are generated as Base64 URL-safe values and can be reverted to the original file id.
- Invalid file links are rejected.
- Secured cookies are read through `JwtService.verifyAsync`.
- Missing, invalid, expired, or malformed secured cookies are rejected.
- Registration rejects mismatched password confirmation.
- Registration rejects an email that already exists.

## Users

User routes are tested in `src/user/user.controller.spec.ts`.

The route tests check that:

- `GET /user/health` returns database health information.
- `GET /user/by-email` finds a user by email and maps it to a DTO.
- `GET /user/by-id` finds a user by id and maps it to a DTO.
- `GET /user/all` returns all users mapped to DTOs.
- `POST /user/login` signs in a user and sets the `session_id` cookie.
- `POST /user/login` rejects invalid login payloads.
- `POST /user/logout` clears the authentication cookie.
- Protected user routes reject unauthenticated requests.

User service behavior is tested in `src/user/user.service.spec.ts`.

The service tests check that:

- Database health checks report successful and failed connections.
- Users can be found by email or id.
- Missing users raise not found errors where required.
- Repository errors from `findById` are wrapped as not found errors.
- All users can be returned.
- New users are created with `hasVerifiedEmail` set to `false`.
- Legacy `create` and `login` service methods still return all users.

## Files

File routes are tested in `src/file/file.controller.spec.ts`.

The route tests check that:

- `POST /file/upload` accepts multipart uploads, passes the uploaded buffer and secured user email to the service, and returns all files when creation succeeds.
- Upload requests without a file are rejected.
- Upload requests without authentication are rejected.
- Forbidden DTO extensions and forbidden uploaded file names are rejected.
- Files that are 1 GiB or larger are rejected by the upload size helpers.
- Uploads return an empty list when creation returns `false`.
- `GET /file/files` returns files for the secured user email.
- `GET /file/files` rejects invalid secured cookies.
- `POST /file/download` streams authenticated downloads.
- Invalid download payloads are rejected.
- `POST /file/download/anonymous` streams anonymous downloads.
- `GET /file/link/:link` resolves a shared link and returns the matching file DTO.
- `DELETE /file/delete/:id` deletes a file by id.

File service behavior is tested in `src/file/file.service.spec.ts`.

The service tests check that upload creation:

- Rejects missing raw file payloads.
- Rejects missing user email references.
- Rejects missing owner users.
- Saves the uploaded file in a transaction.
- Writes the file content through `FileHelper.CreateFileAtPath`.
- Generates a share link from the saved file id.
- Links the file to the owner user.
- Stores hashed file passwords instead of raw upload passwords.
- Normalizes tags and creates one file-tag relation per unique tag.
- Supports existing tags, plain string tags, JSON string tags, duplicate tags, and empty tag input.
- Rejects empty, malformed, or invalid tag entries.
- Calculates expiration dates from `uploadDate` and `expirationTimeInDay`.
- Rejects invalid upload dates.
- Wraps transaction failures with the expected creation error.

The file service tests also check that:

- Files can be found by id and mapped to DTOs with tags and expiration state.
- Missing or expired files are rejected.
- Unprotected files can be downloaded from disk.
- Password-protected files require a matching password before download.
- Downloads reject missing, expired, locked, wrong-password, or empty files.
- All files and files belonging to a user can be returned.
- Files can be deleted from disk and, optionally, from the database.
- Missing files and no-op database deletes are rejected.
- Files shared with a user are queried through the join table.

## Tags

Tag routes are tested in `src/tag/tag.controller.spec.ts`.

The route tests check that:

- `POST /tag/add` creates a tag.
- Invalid tag payloads are rejected before reaching the service.
- `GET /tag/all` returns all tags.
- `DELETE /tag/delete` deletes a tag by id.
- Invalid delete ids are rejected.
- Protected tag routes reject unauthenticated requests.

Tag service behavior is tested in `src/tag/tag.service.spec.ts`.

The service tests check that:

- Tag names are trimmed before saving.
- Blank tag names are rejected.
- Tag names longer than 255 characters are rejected.
- Duplicate tag names are rejected case-insensitively.
- Tags are returned ordered by name.
- Existing tags can be deleted.
- Invalid tag ids are rejected before deleting.
- Deleting a missing tag raises a not found error.

## Coverage Configuration

DTO files are ignored during coverage calculation because they mostly contain request or response shapes and do not hold meaningful business logic.

The Jest configuration excludes them with:

```json
"collectCoverageFrom": [
  "**/*.(t|j)s",
  "!**/*.dto.ts"
]
```
