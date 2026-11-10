// ===== CYLION PORTFOLIO - SECURITY + PLANNER + TICKER =====
// CHANGE YOUR PASSWORD HERE - this one key unlocks all folders
const OWNER_PASSWORD = "Car123los";

let pendingTarget = null;
let unlocked = new Set(); // FIX: was missing, caused crash

// ---------- LOGIN POPUP ----------
const loginModal = document.getElementById("loginModal");
const keyInput = document.getElementById("ownerKeyInput");
const loginTargetText = document.getElementById("loginTargetText");
const loginError = document.getElementById("loginError");

function openLogin(target, targetLabel, anchorEl) {
  pendingTarget = target;
  // FIX: if button only passes 1 arg like openLogin('timetable'), make a nice label
  const label = targetLabel || (target === 'timetable' ? 'Timetable' : target);
  if (loginTargetText) loginTargetText.textContent = `Enter password to unlock: ${label}`;
  if (loginError) loginError.hidden = true;
  if (keyInput) keyInput.value = "";
  if (loginModal) loginModal.hidden = false;
  const box = loginModal?.querySelector(".login-box");
  if (box) { box.style.position = "relative"; box.style.top = "0"; box.style.left = "0"; box.style.transform = "none"; }
  setTimeout(() => keyInput?.focus(), 50);
}
function closeLogin() {
  if (loginModal) loginModal.hidden = true;
  // FIX: do NOT clear pendingTarget here, we need it in tryUnlock
}
function hideTimetableForm() {
  const f = document.getElementById("event-form");
  if (f) { f.classList.remove('event-form-show'); f.classList.add('event-form-hidden'); }
  const note = document.getElementById("timetable-lock-note");
  if (note) note.style.display = "";
}
function showTimetableForm() {
  const f = document.getElementById("event-form");
  if (f) { f.classList.remove('event-form-hidden'); f.classList.add('event-form-show'); }
  const note = document.getElementById("timetable-lock-note");
  if (note) note.style.display = "none";
}

function tryUnlock() {
  if (keyInput.value === OWNER_PASSWORD) {
    const target = pendingTarget; // FIX: save BEFORE closing
    unlocked.add(target);
    if (loginModal) loginModal.hidden = true;
    pendingTarget = null;

    if (target === "certifications") {
      document.getElementById("certFileInput")?.click();
    } else if (target === "timetable") {
      showTimetableForm(); // FIX: use class, not display:grid which scattered it
    } else if (target) {
      const input = document.querySelector('.file-input[data-category="' + target + '"]');
      if (input) input.click();
    }
  } else {
    if (loginError) loginError.hidden = false;
    keyInput?.select();
  }
}
document.getElementById("loginUnlockBtn")?.addEventListener("click", tryUnlock);
document.getElementById("loginClose")?.addEventListener("click", () => { if (loginModal) loginModal.hidden = true; pendingTarget = null; hideTimetableForm(); });
keyInput?.addEventListener("keydown", e => { if (e.key === "Enter") tryUnlock(); });
loginModal?.addEventListener("click", e => { if (e.target === loginModal) { loginModal.hidden = true; pendingTarget = null; } });

// Any Add button requires key first
document.querySelectorAll(".add-files-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.lockTarget;
    const label = btn.closest(".upload-category")?.querySelector("h4")?.textContent || target;
    openLogin(target, label, btn.closest(".upload-category"));
  });
});

// FIX: Timetable + button - was missing, so button did nothing after fix
document.querySelector(".add-timetable-btn")?.addEventListener("click", (e) => {
  e.preventDefault();
  openLogin("timetable", "Timetable", document.querySelector(".schedule-card"));
});

document.getElementById("addCertCard")?.querySelector("button")?.addEventListener("click", () => {
  openLogin("certifications", "Add next certification", document.getElementById("addCertCard"));
});

// ---------- STUDY FILES ----------
document.querySelectorAll(".file-input").forEach(input => {
  input.addEventListener("change", () => {
    const cat = input.dataset.category;
    const list = document.querySelector(`[data-list="${cat}"]`);
    if (!list) return;
    if (list.textContent.includes("No files")) list.innerHTML = "";
    [...input.files].forEach(file => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="file-name">${file.name}</span> <span style="color:#86f0c2">✓ added (this session)</span>`;
      list.appendChild(li);
    });
    input.value = "";
  });
});

// ---------- CERTIFICATES - VIEW ONLY ----------
const viewer = document.getElementById("certViewer");
const viewerImg = document.getElementById("certViewerImg");
const viewerTitle = document.getElementById("certViewerTitle");
document.querySelectorAll(".cert-view-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    viewerImg.src = btn.dataset.src;
    viewerTitle.textContent = btn.dataset.title || "Certificate";
    viewer.hidden = false;
  });
});
document.getElementById("certViewerClose")?.addEventListener("click", () => { viewer.hidden = true; viewerImg.src = ""; });
viewer?.addEventListener("click", e => { if (e.target === viewer) { viewer.hidden = true; viewerImg.src = ""; } });
document.querySelectorAll(".certificate-card img, .portrait-frame img").forEach(img => {
  img.addEventListener("contextmenu", e => e.preventDefault());
  img.addEventListener("dragstart", e => e.preventDefault());
});
document.addEventListener("contextmenu", e => {
  if (e.target.closest(".certificate-card")) e.preventDefault();
});

// ---------- TIMETABLE + TICKER ----------
const EV_KEY = "myEvents";
const ticker = document.getElementById("reminder-ticker");
const track = document.getElementById("reminder-track");
const form = document.getElementById("event-form");
const eventList = document.getElementById("event-list");
function getEvents() { try { return JSON.parse(localStorage.getItem(EV_KEY) || "[]"); } catch { return []; } }
function remain(delta) { const h = Math.floor(delta / 3600000); const m = Math.floor((delta % 3600000) / 60000); return `${h}h ${m}m`; }
function showEvents() {
  const now = Date.now();
  const all = getEvents().map(e => ({ ...e, delta: Date.parse(e.start) - now })).filter(e => e.delta > 0 && e.delta <= 36000000);
  if (ticker) ticker.hidden = !all.length;
  if (track) {
    track.replaceChildren();
    all.forEach(e => {
      const s = document.createElement("span");
      s.className = "ticker-message";
      s.textContent = `${e.title} · starts in ${remain(e.delta)} · ${new Date(e.start).toLocaleString()}${e.details ? " · " + e.details : ""}`;
      track.append(s, s.cloneNode(true));
    });
  }
  if (eventList) {
    if (!getEvents().length) eventList.innerHTML = `<tr><td colspan="4">No activities scheduled yet.</td></tr>`;
    else eventList.innerHTML = getEvents().map(e => `<tr><td>${e.title}</td><td>${new Date(e.start).toLocaleString()}</td><td>${e.details || ""}</td><td><button type="button" class="file-action remove-action" data-del="${e.id}">Delete</button></td></tr>`).join("");
    eventList.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => {
      if (!unlocked.has("timetable")) { openLogin("timetable", "Timetable - Delete requires key", document.querySelector(".schedule-card")); return; }
      localStorage.setItem(EV_KEY, JSON.stringify(getEvents().filter(x => x.id !== b.dataset.del)));
      showEvents();
    }));
  }
}
if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault();
    if (!unlocked.has("timetable")) { openLogin("timetable", "Timetable - Key required to add", document.querySelector(".schedule-card")); return; }
    const d = new FormData(form);
    const start = new Date(String(d.get("start")));
    if (!Number.isFinite(start.getTime()) || start.getTime() <= Date.now()) { alert("Choose a future start date and time."); return; }
    const es = getEvents();
    // FIX: your HTML uses name="activity", not "title"
    es.push({ id: Math.random().toString(36).slice(2, 9), title: String(d.get("activity") || "").trim(), details: String(d.get("details") || "").trim(), start: start.toISOString() });
    localStorage.setItem(EV_KEY, JSON.stringify(es));
    form.reset(); showEvents();
    hideTimetableForm(); // FIX: hide again after adding, like you wanted
  });
}
showEvents();
setInterval(showEvents, 60000);

// ---------- CONTACT FORM ----------
document.getElementById('contact-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('cf-name')?.value.trim() || '';
  const email = document.getElementById('cf-email')?.value.trim() || '';
  const phone = document.getElementById('cf-phone')?.value.trim() || '';
  const msg = document.getElementById('cf-message')?.value.trim() || '';
  const subject = encodeURIComponent('New message from ' + name + ' - Portfolio');
  const body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\nPhone: ' + phone + '\n\nMessage:\n' + msg);
  const note = document.getElementById('contact-form-note');
  if (note) note.hidden = false;
  window.location.href = 'mailto:c.samson0211@miva.edu.ng?subject=' + subject + '&body=' + body;
  setTimeout(() => { this.reset(); }, 1000);
});

// ---------- MOBILE MENU ----------
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-links");
  hamburger?.addEventListener("click", () => { navMenu.classList.toggle("open"); hamburger.classList.toggle("active"); });
  document.querySelectorAll(".nav-links a").forEach(link => link.addEventListener("click", () => { navMenu.classList.remove("open"); hamburger.classList.remove("active"); }));
  const y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
});