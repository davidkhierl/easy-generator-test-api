export {};

declare module 'express-session' {
  interface SessionData {
    refresh_token?: string;
  }
}
