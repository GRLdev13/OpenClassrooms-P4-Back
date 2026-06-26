# Security

This document describes the main security choices currently used by the API, plus a few important risks and improvement points.

## HTTP Cookies

Authentication is handled with an HTTP cookie named `session_id`.

After a successful login or registration, the API signs a JWT and writes it to the response cookie. Protected routes use `CookieAuthGuard` to read this cookie and verify the JWT before allowing access.

Cookie settings:

- `httpOnly: true`: frontend JavaScript cannot read the session cookie directly.
- `sameSite: 'strict'`: helps reduce cross-site request forgery risk.
- `secure: true` in production: the cookie is only sent over HTTPS when `NODE_ENV=production`.
- `path: '/'`: the cookie is available to the whole API.
- `maxAge: 1 hour`: sessions expire after one hour.

Important note: `secure` is disabled outside production so local development can work over HTTP.

## JWT Secret

The JWT secret is read from `JWT_SECRET`.

In production, the API fails to start if `JWT_SECRET` is missing. In non-production environments, the code falls back to a development-only secret.

This is good for local development, but production deployments must always provide a strong secret through environment configuration.

## User Password Storage

User passwords are never stored in plain text.

The API hashes passwords with Node's `crypto.scryptSync`, using:

- A random salt generated with `randomBytes`.
- A 64-byte derived key.
- A stored format of `salt:hash`.

During login, the submitted password is hashed again with the stored salt and compared with the stored hash using `timingSafeEqual`. This avoids simple timing attacks during password comparison.

Current password rule:

- Passwords must be at least 8 characters long.

Possible improvement:

- Add stronger password policy rules if the project requires them.
- Consider rate limiting login attempts to reduce brute-force risk.

## File Password Storage

Uploaded files can optionally have a password.

File passwords use the same hashing helper as user passwords. The raw file password is not stored in the database. When a protected file is downloaded, the submitted password is compared against the stored hash.

This protects file passwords if the database is leaked, but it does not encrypt the file content itself.

## File Content Storage

The content of the uploaded files is stored on the host machine in a default public folder (`c:/home/datashare/files`).
The folder's path is given by using the primitive: process.env.USERPROFILE or homedir().

The frontend sends a binary array, which the API then saves to the default defined path.

The file names and their extensions are obfuscated on the local system, but their content is not.


Possible improvement:

- Add application-level encryption for stored file contents if confidentiality at rest is required.

## TypeORM Entity Access

The API uses TypeORM repositories and query builders for entity access.

Examples:

- `findOne({ where: { ... } })` for structured lookups.
- Repository `save` and `delete` operations.
- Query builder parameters such as `:name` for tag lookup.

This is safer than string-concatenated SQL because TypeORM parameterizes values in normal repository/query-builder use.

## GUID Identifiers

Database IDs use UUID/GUID primary keys through TypeORM's `@PrimaryGeneratedColumn('uuid')`.

This applies to core entities such as:

- Users
- Files
- Tags
- File-user links
- File-tag links
- Types

UUIDs are better than sequential numeric IDs for public-facing resources because they are harder to guess by enumeration.

Important limitation:

- UUIDs are identifiers, not access control.
- Protected file operations still need authorization checks to ensure the requester is allowed to access the requested file.

## File Upload Validation

File uploads are handled through Nest's `FileInterceptor`.

The upload route requires:

- A valid session cookie.
- A multipart file field named `file`.
- A file body validated by `FileValidator`.

`FileValidator` rejects dangerous extensions such as:

- `.exe`
- `.bat`
- `.cmd`
- `.js`
- `.ps1`
- `.sh`
- `.vbs`
- `.msi`

This reduces the risk of uploading obviously executable files.

Important limitations:

- Extension checks are not complete content validation.
- The API should also enforce file size limits.
- The API should consider MIME type checks or antivirus scanning if users can share files broadly.

## File Links

The API can generate a file link from a file UUID by encoding the UUID as base64url.

The reverse operation validates that the decoded value looks like a UUID before using it.

Important limitation:

- This link is encoded, not cryptographically secret.
- Anyone who obtains the link may be able to resolve the file metadata if they are authenticated, but thats on purpose since sharing a file is a "broad feature".

Possible improvement:

- Add expiration and revocation for share links.

## Expiration Dates

Uploaded files receive an expiration date based on `expirationTimeInDay`.

Download and lookup logic checks whether the file has expired before returning content or metadata.

This is useful for limiting file lifetime, but cleanup of expired records is a separate operational concern.

## Known Security Gaps And Improvement Points

- Some file endpoints use only authentication and may need stricter authorization checks per file owner.
- File content is not encrypted by the application before storage.
- Upload size limits should be configured to prevent very large uploads.
- Extension checks should not be treated as full malware protection.
- Login/register endpoints should ideally have rate limiting.
- Production must use HTTPS so `secure` cookies are effective.
- Production must provide a strong `JWT_SECRET`.
- TypeORM `synchronize` is enabled outside production, which is convenient locally but should remain disabled in production.
