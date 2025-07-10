
// Function to extract the text content of the webpage
function extractPageContent() {
  return document.body.innerText;
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extract") {
    // Extract and send back the page content
    sendResponse({content: extractPageContent()});
  }
});
