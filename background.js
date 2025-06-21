let activeTabId = null;
let activeTabStart = null;

// Function to log a new entry with timestamp
function logTimeEntry() {
  if (activeTabId !== null && activeTabStart !== null) {
    const now = Date.now();
    const timeSpent = now - activeTabStart;

    chrome.tabs.get(activeTabId, ({ url }) => {
      const domain = new URL(url).hostname;
      const timestamp = Date.now();

      chrome.storage.sync.get(["log"], (result) => {
        const log = result.log || [];
        log.push({ domain, time: timeSpent, timestamp });
        chrome.storage.sync.set({ log });
      });
    });

    activeTabStart = now;
  }
}

// Log time every 15s
setInterval(logTimeEntry, 15000);

// Log on tab switch
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await logTimeEntry();
  activeTabId = activeInfo.tabId;
  activeTabStart = Date.now();
});

// Reset tracking on browser restart
chrome.runtime.onStartup.addListener(() => {
  activeTabId = null;
  activeTabStart = null;
});
