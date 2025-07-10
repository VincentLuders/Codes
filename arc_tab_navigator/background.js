
let tabOrder = [];

chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.query({currentWindow: true}, (tabs) => {
        tabOrder = tabs.map(tab => tab.id);
        chrome.storage.local.set({tabOrder});
    });
});

chrome.tabs.onCreated.addListener((tab) => {
    tabOrder.push(tab.id);
    chrome.storage.local.set({tabOrder});
});

chrome.tabs.onRemoved.addListener((tabId) => {
    tabOrder = tabOrder.filter(id => id !== tabId);
    chrome.storage.local.set({tabOrder});
});

chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        let activeTabId = tabs[0].id;
        let index = tabOrder.indexOf(activeTabId);
        if (command === "move-left" && index > 0) {
            chrome.tabs.update(tabOrder[index - 1], {active: true});
        } else if (command === "move-right" && index < tabOrder.length - 1) {
            chrome.tabs.update(tabOrder[index + 1], {active: true});
        }
    });
});
