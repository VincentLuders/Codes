// ARC Tab Navigator - Content Script

// Listen for keydown events
document.addEventListener('keydown', function(event) {
  // Only intercept R and W when they're not in an input field
  const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) || 
                       document.activeElement.isContentEditable;
  
  if (!isInputField) {
    // W key for left tab navigation
    if (event.key === 'w' || event.key === 'W') {
      event.preventDefault();
      chrome.runtime.sendMessage({action: "navigateTab", direction: "left"});
    }
    // R key for right tab navigation
    else if (event.key === 'r' || event.key === 'R') {
      event.preventDefault();
      chrome.runtime.sendMessage({action: "navigateTab", direction: "right"});
    }
  }
});

// Display a small notification when tab navigation occurs
function showNotification(direction) {
  const notification = document.createElement('div');
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.padding = '8px 12px';
  notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  notification.style.color = 'white';
  notification.style.borderRadius = '4px';
  notification.style.zIndex = '9999';
  notification.style.transition = 'opacity 0.3s';
  notification.textContent = direction === 'left' ? '◀ Previous Tab' : 'Next Tab ▶';
  
  document.body.appendChild(notification);
  
  // Remove after 1 second
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 1000);
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "tabNavigated") {
    showNotification(message.direction);
  }
  return true;
});
