# Back-End Architecture

## API Purpose

This API is a NestJS backend for a small file sharing application. It lets users create an account, log in, upload files, and later access file metadata or download protected files.

The application uses PostgreSQL through TypeORM. The main domain entities are users, files, tags, and the join tables that links users and tags.

## Main Modules

- `AuthModule`: handles login, registration, password hashing, JWT session creation, and session validation.
- `UserModule`: manages user lookup and user creation.
- `FileModule`: handles file upload, file listing, file download, generated file links, deletion, passwords, expiration dates, and tags.
- `TagModule`: manages reusable tags that can be attached to uploaded files.

## Code Structure

The code is structured around the MVC pattern, splitting responsabilities between components, enforcing SOLID principles, code clarity, easy testing and debugging.


# Front-End Architecture

## Overview

DataShare is a React front end built with React Router 7, TypeScript, Tailwind CSS, PrimeReact, and Redux Toolkit Query. The application focuses on file sharing workflows: users can create an account, log in, upload protected files, manage their files, and download files from shared links.

The front end expects a back-end API at `http://localhost:3000/`.

## Application Structure

- `app/root.tsx` defines the HTML layout, global styles, Redux provider, and route outlet.
- `app/routes.ts` registers the main routes:
  - `/` for the welcome page.
  - `/login` for authentication.
  - `/register` for account creation.
  - `/files` for the file dashboard.
- `app/services/app-service.ts` centralizes API access with Redux Toolkit Query.
- `app/stores/store.ts` configures the Redux store and RTK Query middleware.
- `app/views/` contains user-facing screens and reusable view components.
- `app/dto/` contains typed data transfer objects used by forms and API calls.

## Main Front-End Features

### Authentication

The app includes login and registration screens. Login stores the returned token and email in `localStorage`, then redirects the user to the file dashboard. Registration collects first name, last name, email, password, and password confirmation before sending the account creation request.

### File Dashboard

The `/files` route displays the authenticated file management area. It fetches the user's files through RTK Query, shows loading and error states, and supports manual refresh after uploads or deletions.

Users can filter files by:

- All files.
- Active files.
- Expired files.

Expired files are shown as unavailable for download.

### File Upload

The upload flow uses PrimeReact components for file selection, expiration selection, and tag selection. Users can:

- Upload one file at a time.
- Choose an expiration period from 1 to 7 days.
- Add existing tags.
- Create custom tags during upload.
- Optionally protect a file with a password.

The selected file and metadata are sent as `FormData` to the API.

### File Download

Files can be downloaded from the dashboard or by using a shared link. Password-protected files prompt the user for a password before download. The front end receives the response as a `Blob` and triggers a browser download with the original file name.

### File Sharing Links

Files with a share link expose an action to display the link. The app also provides a link-based download flow where a user pastes a file link, reviews the file metadata, and downloads it if available.

### File Deletion

Each active file can be deleted from the dashboard. After deletion, the file list is refetched so the UI stays in sync with the back end.

### Error Handling

`ErrorsComponent.tsx` normalizes several possible error shapes, including RTK Query errors, validation errors, plain strings, and JavaScript `Error` objects. This gives forms and file actions a shared way to display request failures.

## API Layer

The RTK Query service exposes hooks for:

- Registering, logging in, and logging out.
- Deleting a user.
- Uploading files.
- Listing files.
- Resolving files from shared links.
- Downloading files.
- Deleting files.
- Reading tags.

The generated hooks are consumed directly inside route and view components, which keeps API state such as loading, errors, and cached data close to the UI.

## Styling

Global styles live in `app/app.css`. Tailwind CSS provides utility classes, while custom `ds-*` component classes define the DataShare dashboard, modal, form, file row, and button styling. PrimeReact theme styles are imported globally in `app/root.tsx`.

## Testing

The project uses Jest with React Testing Library. Existing tests cover user flows, file flows, error display behavior, and an authentication end-to-end style test.

