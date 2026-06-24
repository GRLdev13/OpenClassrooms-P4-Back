# Architecture

## API Purpose

This API is a NestJS backend for a small file sharing application. It lets users create an account, log in, upload files, and later access file metadata or download protected files.

The application uses PostgreSQL through TypeORM. The main domain entities are users, files, tags, and the join tables that link files to users and tags.

## Main Modules

- `AuthModule`: handles login, registration, password hashing, JWT session creation, and session validation.
- `UserModule`: manages user lookup and user creation.
- `FileModule`: handles file upload, file listing, file download, generated file links, deletion, passwords, expiration dates, and tags.
- `TagModule`: manages reusable tags that can be attached to uploaded files.

## Testing

The project uses Jest for unit and route-level tests.

Current coverage focuses on:

- Auth registration and login behavior.
- Cookie creation.
- File upload route behavior.
- File upload service behavior such as validation, password hashing, tags, and expiration dates.

DTO files are excluded from coverage calculation through the Jest `collectCoverageFrom` configuration.
