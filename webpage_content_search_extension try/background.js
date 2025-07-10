
// Listen for clicks on the extension icon
chrome.action.onClicked.addListener(function() {
  // Open the search page in a new tab
  chrome.tabs.create({ url: 'search.html' });
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the page has finished loading
  if (changeInfo.status === 'complete' && tab.url) {
    // Send a message to the content script to extract page content
    chrome.tabs.sendMessage(tabId, {action: "extract"}, response => {
      if (response && response.content) {
        // Save the extracted content
        savePageContent(tab.url, response.content, tab.title);
      }
    });
  }
});

// Function to save page content to local storage
function savePageContent(url, content, title) {
  const timestamp = new Date().getTime();
  chrome.storage.local.get(['pages', 'settings'], result => {
    let pages = result.pages || [];
    const settings = result.settings || { retentionPeriod: 2592000000 }; // Default 30 days

    // Add new page content
    pages.push({ url, content, title, timestamp });

    // Remove old entries
    const cutoffTime = timestamp - settings.retentionPeriod;
    pages = pages.filter(page => page.timestamp >= cutoffTime);

    // Save updated pages to storage
    chrome.storage.local.set({ pages: pages });
  });
}
