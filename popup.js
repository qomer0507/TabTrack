function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  return `${minutes} min`;
}

function cleanDomain(domain) {
  return domain
    .replace("www.", "")
    .replace(/\.(com|org|net|io|gov|edu|co|us|uk|info|dev|xyz|me)$/i, "")
    .split(".")[0];
}

// Filter logs based on selected time range
function filterLogByRange(log, range) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;

  return log.filter(entry => {
    if (range === "day") return now - entry.timestamp <= oneDay;
    if (range === "week") return now - entry.timestamp <= oneWeek;
    return true;
  });
}

// Sum time by domain
function aggregateTime(log) {
  const timeByDomain = {};
  log.forEach(({ domain, time }) => {
    timeByDomain[domain] = (timeByDomain[domain] || 0) + time;
  });
  return Object.entries(timeByDomain).sort((a, b) => b[1] - a[1]);
}

// Update display
function updateView(range) {
  chrome.storage.sync.get(["log"], (result) => {
    const log = result.log || [];
    const filtered = filterLogByRange(log, range);
    const aggregated = aggregateTime(filtered);
    const container = document.getElementById("data");
    container.innerHTML = "";

    if (aggregated.length === 0) {
      container.innerText = "No tab usage data yet!";
      return;
    }

    aggregated.forEach(([domain, time]) => {
      const entry = document.createElement("div");
      entry.className = "site-entry";
      entry.innerHTML = `
        <span class="site-name">${cleanDomain(domain)}</span>
        <span class="time">${formatTime(time)}</span>
      `;
      container.appendChild(entry);
    });
  });
}

// Load default view
updateView("day");

// Handle tab switches
document.querySelectorAll(".tab-button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    updateView(btn.dataset.range);
  });
});

// Clear all history (default version)
document.getElementById("clear-btn").addEventListener("click", () => {
  chrome.storage.sync.set({ log: [] }, () => {
    window.location.reload();
  });
});
