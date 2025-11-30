# Safewalk

Safewalk is a small safety/web app that helps users share their location and send an SMS alert to trusted contacts. The repository contains a front-end (HTML/CSS/JS) and a small server-side script for sending SMS messages.

## Features
- Ask user for geolocation permission and obtain coordinates
- UI to trigger sending current location to preconfigured contacts via SMS
- Simple server-side SMS sender (expects credentials via environment variables)
- Netlify-ready front-end configuration

## Quick links
- Front-end: `index.html`, `script.js`, `style.css`
- Server SMS helper: `send-sms.js`
- Netlify config: `netlify.toml`

## Setup (local)
1. Clone the repo
   ```
   git clone https://github.com/Priyasarkar11/Safewalk.git
   cd Safewalk
   ```

2. Front-end
   - `index.html` can be opened directly in a browser for static testing.
   - For local development with Netlify CLI:
     ```
     npm install -g netlify-cli
     netlify dev
     ```

3. Server (SMS)
   - This project expects a small Node script to send SMS (send-sms.js). Run it with Node after installing dependencies.
   - Create a `.env` file (do NOT commit) with the required vars:
     ```
     TWILIO_ACCOUNT_SID=your_sid_here
     TWILIO_AUTH_TOKEN=your_token_here
     TWILIO_FROM_PHONE=+1234567890
     RECIPIENT_PHONE=+10987654321
     PORT=3000
     ```
   - Install and run:
     ```
     npm install
     npm start
     ```

## Environment variables
- TWILIO_ACCOUNT_SID — Twilio account SID (or other provider credentials)
- TWILIO_AUTH_TOKEN — Twilio auth token
- TWILIO_FROM_PHONE — phone number used as the sender
- RECIPIENT_PHONE — destination phone number(s) or source for contact list
- PORT — server port

Important: Never commit `.env` or secrets into git. Use environment variable management on the host (Netlify, Heroku, Vercel, or your VPS).

## Security & privacy notes
- Require explicit user consent for location sharing.
- Only retain location data for as long as necessary; document retention policy.
- Protect the SMS endpoint with authentication or server-side checks and rate limiting to prevent abuse.
- Monitor for unusual SMS usage to avoid unexpected costs.

## To improve this project
- Add a fuller server implementation with authentication and logging.
- Move API keys into secure environment/storage and do not place them in code.
- Add tests and a CI pipeline (GitHub Actions) for linting and basic test coverage.
- Add a CONTRIBUTING.md and LICENSE (e.g., MIT) if you want others to contribute.

## Contact / Contribution
Open an issue or submit a PR. If you’d like, I can help open PRs for:
- A full README (this one)
- Adding a .gitignore and LICENSE
- Moving secrets to env vars and adding sample .env.example
