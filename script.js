// SafeWalk 2.0 frontend
const DEMO_MODE = false; // set to false after deploy to use live SMS via Twilio
const sosBtn = document.getElementById('sosBtn');
const statusEl = document.getElementById('status');
const silentTrigger = document.getElementById('silentTrigger');

// 🔹 New: extra DOM elements

// Emergency profile inputs
const userNameInput = document.getElementById('userName');
const bloodGroupInput = document.getElementById('bloodGroup');
const medicalNotesInput = document.getElementById('medicalNotes');

// Safe Walk elements
const walkDurationSelect = document.getElementById('walkDuration');
const startWalkBtn = document.getElementById('startWalkBtn');
const iAmSafeBtn = document.getElementById('iAmSafeBtn');
const walkStatusEl = document.getElementById('walkStatus');

// Visible Silent SOS zone
const hiddenZone = document.getElementById('hiddenZone');

// Safe Walk timer state
let walkTimerId = null;
let userConfirmedSafe = false;

function setStatus(msg) {
  statusEl.textContent = msg;
}

// ===== Emergency Profile: save/load in browser storage =====

function saveProfileToStorage() {
  if (!userNameInput || !bloodGroupInput || !medicalNotesInput) return;

  const profile = {
    name: userNameInput.value,
    blood: bloodGroupInput.value,
    notes: medicalNotesInput.value,
  };

  try {
    localStorage.setItem('safewalk_profile', JSON.stringify(profile));
  } catch (e) {
    console.warn('Could not save profile to storage', e);
  }
}

function loadProfileFromStorage() {
  if (!userNameInput || !bloodGroupInput || !medicalNotesInput) return;

  try {
    const raw = localStorage.getItem('safewalk_profile');
    if (!raw) return;

    const profile = JSON.parse(raw);
    userNameInput.value = profile.name || '';
    bloodGroupInput.value = profile.blood || '';
    medicalNotesInput.value = profile.notes || '';
  } catch (e) {
    console.warn('Could not load profile from storage', e);
  }
}

// Build extra text for SOS using profile
function getProfileTextForMessage() {
  if (!userNameInput || !bloodGroupInput || !medicalNotesInput) return '';

  const name = (userNameInput.value || '').trim();
  const blood = (bloodGroupInput.value || '').trim();
  const notes = (medicalNotesInput.value || '').trim();

  if (!name && !blood && !notes) {
    return ''; // nothing filled
  }

  let extra = '\n\n🧑 Emergency Profile:\n';
  if (name) extra += `Name: ${name}\n`;
  if (blood) extra += `Blood Group: ${blood}\n`;
  if (notes) extra += `Medical Notes: ${notes}\n`;
  return extra;
}

// Call once (script is loaded with defer, so DOM is ready)
loadProfileFromStorage();

// Save whenever user types in the profile fields
[userNameInput, bloodGroupInput, medicalNotesInput].forEach((el) => {
  if (!el) return;
  el.addEventListener('input', saveProfileToStorage);
});

// ===== check location permission on load =====
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
      if (err.code === 1)
        setStatus('⚠️ Location permission denied — enable it in browser settings');
      else if (err.code === 2) setStatus('⚠️ Location unavailable');
      else if (err.code === 3) setStatus('⚠️ Location request timed out');
      sosBtn.disabled = true;
    },
    { enableHighAccuracy: false, timeout: 10000 }
  );
});

// ===== function to send message to backend (unchanged logic) =====
async function sendMessage(message) {
  if (DEMO_MODE) {
    // simulate network delay
    setStatus('📡 (Demo) Sending SOS — please wait...');
    await new Promise((r) => setTimeout(r, 900));
    setStatus('✅ (Demo) SOS sent successfully!');
    return;
  }

  setStatus('📡 Sending SOS — please wait...');
  try {
    const resp = await fetch('/.netlify/functions/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
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

// ===== main SOS click (now includes profile info) =====
sosBtn.addEventListener('click', async () => {
  try {
    setStatus('📍 Getting live location...');
    sosBtn.disabled = true;
    const pos = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
      });
    });
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const mapsLink = `https://maps.google.com/?q=${lat},${lon}`;

    let baseMessage = `🚨 HELP! I need help. My location: ${mapsLink}`;
    const profileText = getProfileTextForMessage();
    const finalMessage = baseMessage + profileText;

    await sendMessage(finalMessage);
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

// ===== existing Silent trigger (top-right) — double-click =====
silentTrigger.addEventListener('click', async () => {
  const now = Date.now();
  if (silentTrigger.lastClick && now - silentTrigger.lastClick < 600) {
    try {
      setStatus('📍 Getting live location (silent)...');
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15015,
        });
      });
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const mapsLink = `https://maps.google.com/?q=${lat},${lon}`;

      let baseMessage = `🚨 HELP! I need help. My location: ${mapsLink}`;
      const profileText = getProfileTextForMessage();
      const finalMessage = baseMessage + profileText;

      await sendMessage(finalMessage);
    } catch (err) {
      console.error(err);
      setStatus('⚠️ Silent SOS failed to get location');
    }
  } else {
    silentTrigger.lastClick = now;
    // no visible change; this is a hidden trigger
  }
});

// ===== Safe Walk Timer Logic =====
if (startWalkBtn && iAmSafeBtn && walkDurationSelect && walkStatusEl && sosBtn) {
  startWalkBtn.addEventListener('click', () => {
    const minutes = parseInt(walkDurationSelect.value, 10) || 15;

    // Clear old timer if any
    if (walkTimerId) {
      clearTimeout(walkTimerId);
      walkTimerId = null;
    }
    userConfirmedSafe = false;

    walkStatusEl.textContent =
      `✅ Safe Walk started for ${minutes} minutes. Please press "I am Safe" when you reach.`;
    iAmSafeBtn.disabled = false;

    // Start timer
    walkTimerId = setTimeout(() => {
      if (!userConfirmedSafe) {
        walkStatusEl.textContent =
          '⚠️ Time over! You did not confirm. Triggering auto SOS...';

        if (typeof setStatus === 'function') {
          setStatus('⚠️ Auto SOS triggered by Safe Walk timeout.');
        }
        // Reuse existing SOS behaviour
        sosBtn.click();
      }
    }, minutes * 60 * 1000); // minutes → milliseconds
  });

  iAmSafeBtn.addEventListener('click', () => {
    userConfirmedSafe = true;

    if (walkTimerId) {
      clearTimeout(walkTimerId);
      walkTimerId = null;
    }

    walkStatusEl.textContent =
      '😊 You confirmed you are safe. No SOS will be sent.';
    iAmSafeBtn.disabled = true;
  });
}

// ===== Visible Silent / Hidden SOS Logic (3 taps area) =====
if (hiddenZone && sosBtn) {
  let tapCount = 0;
  let firstTapTime = 0;
  const TAP_WINDOW_MS = 5000; // 5 seconds for 3 taps

  hiddenZone.addEventListener('click', () => {
    const now = Date.now();

    if (tapCount === 0) {
      // first tap
      firstTapTime = now;
      tapCount = 1;
    } else {
      if (now - firstTapTime <= TAP_WINDOW_MS) {
        tapCount += 1;
      } else {
        // Too slow, restart
        firstTapTime = now;
        tapCount = 1;
      }
    }

    if (tapCount >= 3) {
      // Reset
      tapCount = 0;
      firstTapTime = 0;

      // Silent SOS
      if (typeof setStatus === 'function') {
        setStatus('🔕 Silent SOS triggered (3 taps)...');
      }
      sosBtn.click(); // Use existing SOS logic
    }
  });
}
