import type { Response } from 'express';

export const AUTH_COOKIE_NAME = 'session_id';
export const AUTH_COOKIE_MAX_AGE_MS = 60 * 60 * 1000;

export function setAuthCookie(response: Response, token: string): void {
  response.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
  });
}
