const twilio = require('twilio');

// MODE = 'demo' or 'live'
const MODE = process.env.SAFEWALK_MODE || 'demo';

exports.handler = async (event) => {
  try {
    const { message } = JSON.parse(event.body || '{}');

    if (MODE === 'demo') {
      console.log('[SAFEWALK DEMO] Would send SMS:', message);
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, mode: 'demo', message: 'Simulated send' })
      };
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    const toNumber = process.env.EMERGENCY_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber || !toNumber) {
      return { statusCode: 500, body: JSON.stringify({ success: false, error: 'Missing env variables' }) };
    }

    const client = twilio(accountSid, authToken);
    const resp = await client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber
    });

    return { statusCode: 200, body: JSON.stringify({ success: true, sid: resp.sid }) };
  } catch (err) {
    console.error('send-sms error', err);
    return { statusCode: 500, body: JSON.stringify({ success: false, error: err.message }) };
  }
};
