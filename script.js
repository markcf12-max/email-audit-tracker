let emails = JSON.parse(localStorage.getItem('emails') || '[]');
let deleteId = null;

// Login system
function login() {
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value.trim();

  if (user === "admin" && pass === "1234") {
    localStorage.setItem("loggedIn", "true");
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("trackerSection").style.display = "block";
  } else {
    document.getElementById("trackerSection").style.display = "none";
    document.getElementById("loginSection").style.display = "block";
    document.getElementById("password").value = "";

    const modal = document.getElementById("loginErrorModal");
    modal.style.display = "block";

    modal.classList.remove("shake");
    void modal.offsetWidth;
    modal.classList.add("shake");
  }
}

function closeLoginError() {
  document.getElementById("loginErrorModal").style.display = "none";
}

function logout() {
  localStorage.removeItem("loggedIn");
  document.getElementById("trackerSection").style.display = "none";
  document.getElementById("loginSection").style.display = "block";
}

window.onload = function() {
  if (localStorage.getItem("loggedIn") === "true") {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("trackerSection").style.display = "block";
  }
  renderRecentAudits(); // default view is 3 audits
};

function saveEmail() {
  const text = document.getElementById('emailInput').value.trim();
  const reliable = document.getElementById('paramReliable').value;
  const personable = document.getElementById('paramPersonable').value;
  const fast = document.getElementById('paramFast').value;
  const safe = document.getElementById('paramSafe').value;

  if (!text || !reliable || !personable || !fast || !safe) {
    alert("Please enter the email and select an option for each parameter (including 'No Opportunity').");
    return;
  }

  const now = new Date();
  const entry = { 
    id: Date.now(),
    text,
    reliable,
    personable,
    fast,
    safe,
    date: now.toLocaleString() 
  };

  emails.push(entry);
  localStorage.setItem('emails', JSON.stringify(emails));

  // Reset form
  document.getElementById('emailInput').value = '';
  document.getElementById('paramReliable').value = '';
  document.getElementById('paramPersonable').value = '';
  document.getElementById('paramFast').value = '';
  document.getElementById('paramSafe').value = '';

  // ✅ Show the updated compact view immediately
  renderRecentAudits();
}


// Compact view (last 3 audits)
function renderRecentAudits() {
  const list = document.getElementById('emailList');
  list.innerHTML = '';

  if (emails.length === 0) {
    list.innerHTML = `<div class="email-box"><p>No audits saved yet.</p></div>`;
  } else {
    const displayList = emails.slice(-3).reverse();
    displayList.forEach((entry) => renderEntry(list, entry));
  }

  document.getElementById('auditCount').innerText = emails.length;
  document.getElementById('backRecentBtn').disabled = true;
}

// Full view (all audits)
function renderAllAudits() {
  const list = document.getElementById('emailList');
  list.innerHTML = '';

  if (emails.length === 0) {
    list.innerHTML = `<div class="email-box"><p>No audits saved yet.</p></div>`;
  } else {
    [...emails].reverse().forEach((entry) => renderEntry(list, entry));
  }

  document.getElementById('auditCount').innerText = emails.length;
  document.getElementById('backRecentBtn').disabled = false;
}

// Helper to render one audit entry
function renderEntry(list, entry) {
  const summary = entry.text.length > 50 ? entry.text.substring(0, 50) + "..." : entry.text;
  list.innerHTML += `
    <div class="email-box">
      <div class="summary" onclick="toggleEmail(${entry.id})">${summary}</div>
      <div class="date">Saved on: ${entry.date}</div>
      <div><strong>Reliable:</strong> ${entry.reliable}</div>
      <div><strong>Personable:</strong> ${entry.personable}</div>
      <div><strong>Fast:</strong> ${entry.fast}</div>
      <div><strong>Safe & Secure:</strong> ${entry.safe}</div>
      <textarea id="email${entry.id}" style="display:none;" onchange="editEmail(${entry.id}, this.value)">${entry.text}</textarea>
      <button class="btn btn-danger" onclick="openModal(${entry.id})">Delete</button>
    </div>
  `;
}

function toggleEmail(id) {
  const box = document.getElementById('email' + id);
  if (box) {
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
  }
}

function editEmail(id, newText) {
  const entry = emails.find(e => e.id === id);
  if (entry) {
    entry.text = newText;
    localStorage.setItem('emails', JSON.stringify(emails));
    renderRecentAudits(); // ✅ update compact view
  }
}

function confirmDelete() {
  if (deleteId !== null) {
    emails = emails.filter(e => e.id !== deleteId);
    localStorage.setItem('emails', JSON.stringify(emails));
    renderRecentAudits(); // ✅ update compact view
  }
  closeModal();
}


// Search audits
function searchEmails() {
  const keyword = document.getElementById('searchInput').value.trim().toLowerCase();
  const list = document.getElementById('emailList');
  list.innerHTML = '';

  if (!keyword) {
    renderRecentAudits();
    return;
  }

  const filtered = emails.filter(entry =>
    (entry.text && entry.text.toLowerCase().includes(keyword)) ||
    (entry.reliable && entry.reliable.toLowerCase().includes(keyword)) ||
    (entry.personable && entry.personable.toLowerCase().includes(keyword)) ||
    (entry.fast && entry.fast.toLowerCase().includes(keyword)) ||
    (entry.safe && entry.safe.toLowerCase().includes(keyword))
  );

  if (filtered.length > 0) {
    filtered.reverse().forEach((entry) => renderEntry(list, entry));
  } else {
    list.innerHTML = `<div class="email-box"><p>No audits found for "${keyword}".</p></div>`;
  }

  // Always show total audits count
  document.getElementById('auditCount').innerText = emails.length;
  document.getElementById('backRecentBtn').disabled = false;
}

// Export CSV
function exportCSV() {
  let csvContent = "Audit Number,Date,Reliable,Personable,Fast,Safe,Text\n";
  emails.forEach((entry, i) => {
    const safeText = '"' + entry.text.replace(/"/g, '""') + '"';
    csvContent += `${i+1},"${entry.date}","${entry.reliable}","${entry.personable}","${entry.fast}","${entry.safe}",${safeText}\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "audits_export.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
