// SafeWalk 2.0 frontend
const DEMO_MODE = false; // set to false after deploy to use live SMS via Twilio
const sosBtn = document.getElementById('sosBtn');
const statusEl = document.getElementById('status');
const silentTrigger = document.getElementById('silentTrigger');

function setStatus(msg) {
  statusEl.textContent = msg;
}

// check location permission on load
window.addEventListener('load', () => {
  sosBtn.disabled = true;
  if (!navigator.geolocation) {
    setStatus('⚠️ Geolocation not supported by your browser');
    return;
  }
  setStatus('📍 Checking location permission...');
  navigator.geolocation.getCurrentPosition(
    () => {
      setStatus('✅ Location ready — you can send SOS');
      sosBtn.disabled = false;
    },
    (err) => {
      if (err.code === 1) setStatus('⚠️ Location permission denied — enable it in browser settings');
      else if (err.code === 2) setStatus('⚠️ Location unavailable');
      else if (err.code === 3) setStatus('⚠️ Location request timed out');
      sosBtn.disabled = true;
    },
    { enableHighAccuracy: false, timeout: 10000 }
  );
});

// function to send message to backend
async function sendMessage(message) {
  if (DEMO_MODE) {
    // simulate network delay
    setStatus('📡 (Demo) Sending SOS — please wait...');
    await new Promise(r => setTimeout(r, 900));
    setStatus('✅ (Demo) SOS sent successfully!');
    return;
  }

  setStatus('📡 Sending SOS — please wait...');
  try {
    const resp = await fetch('/.netlify/functions/send-sms.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await resp.json();
    if (resp.ok && data.success) {
      setStatus('✅ SOS sent successfully!');
    } else {
      console.error('send error', data);
      setStatus('❌ Failed to send SOS. Check config.');
    }
  } catch (err) {
    console.error(err);
    setStatus('❌ Network or server error');
  }
}

// main SOS click
sosBtn.addEventListener('click', async () => {
  try {
    setStatus('📍 Getting live location...');
    sosBtn.disabled = true;
    const pos = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000 });
    });
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const mapsLink = `https://maps.google.com/?q=${lat},${lon}`;
    await sendMessage(`🚨 HELP! I need help. My location: ${mapsLink}`);
  } catch (err) {
    console.error(err);
    if (err.code === 1) setStatus('⚠️ Permission denied for location');
    else if (err.code === 2) setStatus('⚠️ Location unavailable');
    else if (err.code === 3) setStatus('⚠️ Location request timed out');
    else setStatus('⚠️ Could not get location');
  } finally {
    sosBtn.disabled = false;
  }
});

// Silent trigger (top-right) — same message
silentTrigger.addEventListener('click', async (e) => {
  // prevent accidental clicks: require double-click quickly
  const now = Date.now();
  if (silentTrigger.lastClick && (now - silentTrigger.lastClick) < 600) {
    try {
      setStatus('📍 Getting live location (silent)...');
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000 });
      });
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const mapsLink = `https://maps.google.com/?q=${lat},${lon}`;
      await sendMessage(`🚨 HELP! I need help. My location: ${mapsLink}`);
    } catch (err) {
      console.error(err);
      setStatus('⚠️ Silent SOS failed to get location');
    }
  } else {
    silentTrigger.lastClick = now;
    // brief visual feedback (none visible to others)
  }
});
