/* Site settings.
 *
 * GOOGLE_CLIENT_ID turns on "Continue with Google". It's free:
 *   1. https://console.cloud.google.com → create a project (any name).
 *   2. APIs & Services → OAuth consent screen → External → fill in app name + support email → Publish app.
 *   3. APIs & Services → Credentials → Create credentials → OAuth client ID → Web application.
 *      Authorized JavaScript origins: https://idtbas.github.io  (add http://localhost:8080 for local testing)
 *   4. Copy the Client ID (ends in .apps.googleusercontent.com) and paste it below.
 * A client ID is public by design, so it is safe to commit. Leave it empty to hide the Google button.
 */
export const GOOGLE_CLIENT_ID = '545190323583-mqjtau78s410veops03do4pdp16s0p3h.apps.googleusercontent.com';
