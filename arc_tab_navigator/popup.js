// ARC Tab Navigator - Popup Script

// When the popup is opened, get the current tab position
document.addEventListener('DOMContentLoaded', function() {
  updateTabPosition();
});

// Update the tab position display
function updateTabPosition() {
  chrome.runtime.sendMessage({action: "getCurrentTabPosition"}, (response) => {
    const positionElement = document.getElementById('tabPosition');
    
    if (response && response.position) {
      const { index, total } = response.position;
      positionElement.textContent = `Tab ${index + 1} of ${total}`;
    } else {
      positionElement.textContent = 'Unknown';
    }
  });
}
