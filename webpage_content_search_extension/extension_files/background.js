chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.create({ url: 'search.html' });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.tabs.sendMessage(tabId, {action: "extract"}, response => {
      if (response && response.content) {
        savePageContent(tab.url, response.content, tab.title);
      }
    });
  }
});

function savePageContent(url, content, title) {
  const timestamp = new Date().getTime();
  chrome.storage.local.get(['pages', 'settings'], result => {
    const pages = result.pages || [];
    const settings = result.settings || { retentionPeriod: 2592000000 }; // Default 30 days

    pages.push({ url, content, title, timestamp });

    // Remove old entries
    const cutoffTime = timestamp - settings.retentionPeriod;
    const filteredPages = pages.filter(page => page.timestamp >= cutoffTime);

    chrome.storage.local.set({ pages: filteredPages });
  });
}