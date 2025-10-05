const twilio = require('twilio');

// MODE = 'demo' or 'live'
const MODE = process.env.SAFEWALK_MODE || 'demo';

exports.handler = async (event) => {
  try {
    const { message } = JSON.parse(event.body || '{}');

    // 🟢 DEMO MODE - Logs instead of sending
    if (MODE === 'demo') {
      console.log('[SAFEWALK DEMO] Would send SMS:', message);
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, mode: 'demo', message: 'Simulated send' })
      };
    }

    // 🟢 LIVE MODE - Real Twilio SMS
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    // Multiple verified numbers
    const recipients = [
      process.env.EMERGENCY_PHONE_NUMBER, // your number
      process.env.MOM_PHONE_NUMBER,       // mom’s number
      process.env.SISTER_PHONE_NUMBER     // sister’s number
    ].filter(Boolean); // removes any empty value

    if (!accountSid || !authToken || !fromNumber || recipients.length === 0) {
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, error: 'Missing Twilio credentials or phone numbers' })
      };
    }

    const client = twilio(accountSid, authToken);
    const results = [];

    // Send SMS to all recipients
    for (const to of recipients) {
      const resp = await client.messages.create({
        body: message,
        from: fromNumber,
        to
      });
      results.push({ to, sid: resp.sid });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        sentTo: recipients,
        results
      })
    };
  } catch (err) {
    console.error('send-sms error', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
