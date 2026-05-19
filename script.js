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
    // Keep tracker hidden
    document.getElementById("trackerSection").style.display = "none";
    document.getElementById("loginSection").style.display = "block";

    // Clear password field
    document.getElementById("password").value = "";

    // Show error modal
    const modal = document.getElementById("loginErrorModal");
    modal.style.display = "block";

    // Trigger shake animation
    modal.classList.remove("shake"); // reset if already applied
    void modal.offsetWidth;          // force reflow
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
  renderEmails(emails);
};

// Audit tracker functions
function saveEmail() {
  const text = document.getElementById('emailInput').value.trim();
  const reliable = document.getElementById('paramReliable').value;
  const personable = document.getElementById('paramPersonable').value;
  const fast = document.getElementById('paramFast').value;
  const safe = document.getElementById('paramSafe').value;

  // Validation: must have email text and a selection for each parameter
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

  renderEmails(emails);
}


let showAll = false; // global toggle state

function renderEmails(listToShow) {
  const list = document.getElementById('emailList');
  list.innerHTML = '';

  // Decide whether to show all or just 3 recent
  const displayList = showAll ? listToShow.slice().reverse() : listToShow.slice(-3).reverse();

  displayList.forEach((entry) => {
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
  });

  document.getElementById('auditCount').innerText = emails.length;

  // Add toggle button at the bottom
  if (emails.length > 3) {
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "btn";
    toggleBtn.textContent = showAll ? "Show Recent (3)" : "Show All Audits";
    toggleBtn.onclick = function() {
      showAll = !showAll;
      renderEmails(emails);
    };
    list.appendChild(toggleBtn);
  }
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
    renderEmails(emails);
  }
}

// Modal functions
function openModal(id) {
  deleteId = id;
  document.getElementById('deleteModal').style.display = 'block';
}
function closeModal() {
  deleteId = null;
  document.getElementById('deleteModal').style.display = 'none';
}
function confirmDelete() {
  if (deleteId !== null) {
    emails = emails.filter(e => e.id !== deleteId);
    localStorage.setItem('emails', JSON.stringify(emails));
    renderEmails(emails);
  }
  closeModal();
}

function searchEmails() {
  const keyword = document.getElementById('searchInput').value.trim().toLowerCase();

  if (!keyword) {
    // If search box is empty, show all
    renderEmails(emails);
    return;
  }

  const filtered = emails.filter(entry => {
    return (
      (entry.text && entry.text.toLowerCase().includes(keyword)) ||
      (entry.reliable && entry.reliable.toLowerCase().includes(keyword)) ||
      (entry.personable && entry.personable.toLowerCase().includes(keyword)) ||
      (entry.fast && entry.fast.toLowerCase().includes(keyword)) ||
      (entry.safe && entry.safe.toLowerCase().includes(keyword))
    );
  });

  if (filtered.length > 0) {
    renderEmails(filtered);
  } else {
    // Show a friendly message if no results
    const list = document.getElementById('emailList');
    list.innerHTML = `<div class="email-box"><p>No audits found for "${keyword}".</p></div>`;
    document.getElementById('auditCount').innerText = emails.length;
  }
}

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
