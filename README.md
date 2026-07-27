# Leon Charles Coaching — Raw ↔ Cooked Lead-Generation App

This version includes:
- Name + email access gate
- Optional separate marketing consent checkbox
- One-time unlock per browser/device using localStorage
- Raw/dry ↔ cooked converter
- Macro estimates
- Leon Charles branding and cut-out image
- PWA/offline support

## Mailchimp connection

The access gate currently works in prototype mode and stores the submitted lead locally in the browser.

To send leads to Mailchimp, set `LEAD_ENDPOINT` at the top of `app.js` to a secure server-side endpoint.

Do NOT place a Mailchimp API key directly in frontend JavaScript.

Your server-side endpoint should accept:

```json
{
  "firstName": "Leon",
  "email": "leon@example.com",
  "marketingConsent": true,
  "source": "raw-cooked-converter"
}
```

The server can then add/update the contact in the chosen Mailchimp audience and separately record marketing consent.

## Test the gate again

The app remembers that the browser has already unlocked it.

To reset during testing, run in the browser console:

```js
localStorage.removeItem("lcc_raw_cooked_unlocked")
```

or clear site data for the app.

## Important

Food nutrition and yield values are still prototype estimates and should be validated before public launch.
