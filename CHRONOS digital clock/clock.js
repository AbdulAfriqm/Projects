/* ================================
   CHRONOS — Clock Logic
   ================================ */

// ── DOM refs ──────────────────────────────────────────────
const $hoursTop   = document.getElementById('hours-top');
const $hoursBot   = document.getElementById('hours-bot');
const $minsTop    = document.getElementById('mins-top');
const $minsBot    = document.getElementById('mins-bot');
const $secsTop    = document.getElementById('secs-top');
const $secsBot    = document.getElementById('secs-bot');
const $period     = document.getElementById('period');
const $date       = document.getElementById('date-display');
const $tz         = document.getElementById('timezone-label');
const $sep1Dots   = document.querySelectorAll('#sep1 .dot');
const $sep2Dots   = document.querySelectorAll('#sep2 .dot');

// ── Helpers ───────────────────────────────────────────────
const pad = n => String(n).padStart(2, '0');

const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

function flash(el) {
  el.classList.remove('flash');
  void el.offsetWidth; // reflow to restart animation
  el.classList.add('flash');
}

// ── Previous values (track changes) ──────────────────────
let prev = { h1:'', h2:'', m1:'', m2:'', s1:'', s2:'', period:'' };

// ── Tick ─────────────────────────────────────────────────
function tick() {
  const now = new Date();

  // ─ Time values ─
  let hours24 = now.getHours();
  const mins  = now.getMinutes();
  const secs  = now.getSeconds();

  const isAM  = hours24 < 12;
  const period = isAM ? 'AM' : 'PM';
  let hours12  = hours24 % 12;
  if (hours12 === 0) hours12 = 12;

  const hh = pad(hours12);
  const mm = pad(mins);
  const ss = pad(secs);

  // ─ Update digits with flash if changed ─
  if ($hoursTop.textContent !== hh[0]) { $hoursTop.textContent = hh[0]; flash($hoursTop); }
  if ($hoursBot.textContent !== hh[1]) { $hoursBot.textContent = hh[1]; flash($hoursBot); }
  if ($minsTop.textContent  !== mm[0]) { $minsTop.textContent  = mm[0]; flash($minsTop);  }
  if ($minsBot.textContent  !== mm[1]) { $minsBot.textContent  = mm[1]; flash($minsBot);  }
  if ($secsTop.textContent  !== ss[0]) { $secsTop.textContent  = ss[0]; flash($secsTop);  }
  if ($secsBot.textContent  !== ss[1]) { $secsBot.textContent  = ss[1]; flash($secsBot);  }

  // ─ Period ─
  $period.textContent = period;

  // ─ Separator pulse (blink every second) ─
  const dotsOn = secs % 2 === 0;
  $sep1Dots.forEach(d => d.classList.toggle('off', !dotsOn));
  $sep2Dots.forEach(d => d.classList.toggle('off', !dotsOn));

  // ─ Date ─
  const dayName   = DAYS[now.getDay()];
  const dayNum    = now.getDate();
  const monthName = MONTHS[now.getMonth()];
  const year      = now.getFullYear();
  $date.textContent = `${dayName}, ${monthName} ${dayNum}, ${year}`;

  // ─ Timezone ─
  const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const offset = -now.getTimezoneOffset();
  const sign   = offset >= 0 ? '+' : '−';
  const absOff = Math.abs(offset);
  const offH   = pad(Math.floor(absOff / 60));
  const offM   = pad(absOff % 60);
  $tz.textContent = `${tzName}  ·  UTC ${sign}${offH}:${offM}`;
}

// ── Start ─────────────────────────────────────────────────
tick();                        // run immediately
setInterval(tick, 1000);       // then every second
