SafeWalk 2.0 — Ready-to-Deploy (Netlify)

How to deploy (quick):
1. Unzip this package.
2. Go to https://app.netlify.com and log in.
3. On Netlify dashboard -> Sites -> Add new site -> Deploy manually.
4. Drag & drop the entire unzipped folder (the folder containing index.html) into Netlify.
5. Wait for deploy to finish and open your site URL.

Important: Environment variables (Netlify site -> Site settings -> Build & deploy -> Environment):
- TWILIO_ACCOUNT_SID  = <your Twilio Account SID>
- TWILIO_AUTH_TOKEN   = <your Twilio Auth Token>
- TWILIO_PHONE_NUMBER = <your Twilio 'from' number, e.g., +1...>
- EMERGENCY_PHONE_NUMBER = <parent's number, e.g., +91...>
- SAFEWALK_MODE = demo   # set to 'live' to enable real SMS after adding Twilio vars

Notes:
- By default SAFEWALK_MODE is 'demo' (no SMS sent). Set to 'live' and add Twilio vars to send real SMS.
- Ensure the EMERGENCY_PHONE_NUMBER is verified in Twilio if using trial account.
- Geolocation works only on HTTPS or localhost. Netlify provides HTTPS automatically.
- For presentation/demo: keep SAFEWALK_MODE=demo to avoid sending live SMS. You can demonstrate location capture and 'Simulated send' behavior.

Silent SOS:
- There's an invisible trigger in the top-right. Double-click it quickly to send a silent SOS (same message).

If you want, I can walk you through adding environment variables on Netlify step-by-step while you're on the site.
