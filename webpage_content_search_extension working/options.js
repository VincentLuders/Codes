
document.addEventListener('DOMContentLoaded', () => {
  const storageInfo = document.getElementById('storage-info');
  const backToSearchButton = document.getElementById('back-to-search');

  // Function to update the storage usage information
  function updateStorageInfo() {
    chrome.storage.local.getBytesInUse(null, (bytesInUse) => {
      const megabytes = (bytesInUse / (1024 * 1024)).toFixed(2);
      storageInfo.textContent = `Storage used: ${megabytes} MB`;
    });
  }

  // Update storage info immediately and then every 5 seconds
  updateStorageInfo();
  setInterval(updateStorageInfo, 5000);

  // Add click event listener to the "Back to Search" button
  backToSearchButton.addEventListener('click', () => {
    window.location.href = 'search.html';
  });

  const toggleModeButton = document.getElementById('toggle-mode');
  let isDarkMode = true;

  toggleModeButton.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.style.backgroundColor = isDarkMode ? '#1e1e1e' : '#ffffff';
    document.body.style.color = isDarkMode ? '#ffffff' : '#000000';
    toggleModeButton.textContent = isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  });

});
