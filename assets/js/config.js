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

/* EMAILJS turns on real emails (order confirmations, welcome, sign-in alerts…). Free: 200 emails a month.
 *   1. https://www.emailjs.com → Sign up.
 *   2. Email Services → Add New Service → Gmail → Connect Account → Create Service. Copy the Service ID.
 *   3. Email Templates → Create New Template:
 *        Subject: {{subject}}      To Email: {{to_email}}      From Name: {{from_name}}
 *        Content: open the code editor (<>) and replace everything with {{{html}}}   (three braces)
 *      Save, then copy the Template ID.
 *   4. Account → General → copy the Public Key.
 * Leave these empty and emails still appear in each customer's account under "Mailbox".
 */
export const EMAILJS = { publicKey: '', serviceId: '', templateId: '' };
