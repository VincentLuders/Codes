// Background script
chrome.runtime.onInstalled.addListener(() => {
    // Initialize storage or other setup tasks
});

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
    if (command === "attach_tab") {
        // Code to attach tab to main window
    } else if (command === "detach_tab") {
        // Code to detach tab to background window
    }
});

// Additional background logic
