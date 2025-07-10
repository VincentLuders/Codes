chrome.commands.onCommand.addListener(function(command) {
    if (command === "download_profile") {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "downloadProfile" });
      });
    }
  });
  
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "downloadComplete") {
      console.log("LinkedIn profile downloaded successfully!");
      // You can add additional logic here if needed
    }
  });