// Background window management
let backgroundWindowId = null;

// Initialize background window
async function initializeBackgroundWindow() {
    const windows = await chrome.windows.getAll();
    const existingBackground = windows.find(w => w.type === 'popup');
    
    if (existingBackground) {
        backgroundWindowId = existingBackground.id;
    } else {
        const window = await chrome.windows.create({
            focused: false,
            type: 'popup',
            state: 'minimized'
        });
        backgroundWindowId = window.id;
    }
}

// Handle tab management
chrome.runtime.onInstalled.addListener(async () => {
    await initializeBackgroundWindow();
    
    // Create context menu items
    chrome.contextMenus.create({
        id: 'detachTab',
        title: 'Move to background',
        contexts: ['tab']
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'detachTab') {
        await moveTabToBackground(tab.id);
    }
});

// Handle commands
// Handle commands
chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'move_to_background') {
        const [activeTab] = await chrome.tabs.query({active: true, currentWindow: true});
        if (activeTab) {
            await moveTabToBackground(activeTab.id);
        }
    } else if (command === 'bring_to_foreground') {
        const backgroundTabs = await getBackgroundTabs();
        if (backgroundTabs.length > 0) {
            const managedTabs = await getManagedTabs();
            const defaultTab = managedTabs.find(t => t.isDefault)?.url;
            const tabToMove = backgroundTabs.find(t => t.url === defaultTab) || backgroundTabs[0];
            if (tabToMove) {
                const [currentWindow] = await chrome.windows.getAll({windowTypes: ['normal'], focused: true});
                await moveTabToForeground(tabToMove.id, currentWindow.id);
            }
        }
    }
});
        if (activeTab) {
            await moveTabToBackground(activeTab.id);
        }
    }
});

// Handle tab closing
chrome.tabs.onBeforeRemoved.addListener(async (tabId, removeInfo) => {
    const tab = await chrome.tabs.get(tabId);
    const managedTabs = await getManagedTabs();
    
    if (managedTabs.some(t => t.url === tab.url)) {
        await moveTabToBackground(tabId);
        // Prevent default close action
        return false;
    }
});

// Helper functions
async function moveTabToBackground(tabId) {
    await chrome.tabs.move(tabId, {windowId: backgroundWindowId, index: -1});
}

async function moveTabToForeground(tabId, windowId) {
    await chrome.tabs.move(tabId, {windowId: windowId, index: -1});
    await chrome.tabs.update(tabId, {active: true});
}

async function getManagedTabs() {
    const result = await chrome.storage.sync.get('managedTabs');
    return result.managedTabs || [];
}

// Listen for navigation to managed URLs
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
    if (details.frameId !== 0) return; // Only handle main frame
    
    const managedTabs = await getManagedTabs();
    const matchingTab = managedTabs.find(t => t.url === details.url);
    
    if (matchingTab) {
        const tabs = await chrome.tabs.query({windowId: backgroundWindowId});
        const existingTab = tabs.find(t => t.url === details.url);
        
        if (existingTab) {
            await moveTabToForeground(existingTab.id, details.windowId);
            // Prevent new navigation
            return false;
        }
    }
});