document.addEventListener('DOMContentLoaded', function() {
    refreshSiteList();

    document.getElementById('addSiteForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addNewSite();
    });
});

async function refreshSiteList() {
    const {sites = []} = await getStorageData('sites');
    const siteList = document.getElementById('siteList');
    siteList.innerHTML = '';
    
    sites.forEach(site => addSiteToList(site));
    updateSiteCount(sites.length);
}

function updateSiteCount(count) {
    document.getElementById('totalSites').textContent = 
        `${count} site${count !== 1 ? 's' : ''}`;
}

async function addNewSite() {
    const urlInput = document.getElementById('siteUrl');
    const errorMsg = document.getElementById('errorMsg');
    const url = urlInput.value.trim();
    
    try {
        new URL(url);
        errorMsg.textContent = '';
    } catch (e) {
        errorMsg.textContent = 'Please enter a valid URL';
        return;
    }
    
    const {sites = []} = await getStorageData('sites');
    
    if (!sites.includes(url)) {
        sites.push(url);
        await setStorageData({sites});
        addSiteToList(url);
        updateSiteCount(sites.length);
        urlInput.value = '';
        
        // Trigger preload
        chrome.runtime.sendMessage({action: 'preload', url});
    } else {
        errorMsg.textContent = 'This site is already in the list';
    }
}

function addSiteToList(url) {
    const siteList = document.getElementById('siteList');
    const div = document.createElement('div');
    div.className = 'site-item';
    
    const siteInfo = document.createElement('div');
    siteInfo.className = 'site-info';
    
    const statusIndicator = document.createElement('span');
    statusIndicator.className = 'status-indicator status-loading';
    
    const urlText = document.createElement('span');
    urlText.textContent = new URL(url).hostname;
    
    const status = document.createElement('div');
    status.className = 'site-status';
    status.textContent = 'Loading...';
    
    siteInfo.appendChild(statusIndicator);
    siteInfo.appendChild(urlText);
    siteInfo.appendChild(status);
    
    const buttons = document.createElement('div');
    buttons.className = 'buttons';
    
    const visitButton = document.createElement('button');
    visitButton.className = 'visit';
    visitButton.textContent = 'Open';
    visitButton.onclick = () => {
        chrome.runtime.sendMessage({action: 'openTab', url});
    };
    
    const removeButton = document.createElement('button');
    removeButton.className = 'remove';
    removeButton.textContent = 'Remove';
    removeButton.onclick = async () => {
        const {sites = []} = await getStorageData('sites');
        const newSites = sites.filter(site => site !== url);
        await setStorageData({sites: newSites});
        div.remove();
        updateSiteCount(newSites.length);
    };
    
    buttons.appendChild(visitButton);
    buttons.appendChild(removeButton);
    
    div.appendChild(siteInfo);
    div.appendChild(buttons);
    siteList.appendChild(div);
    
    // Update status periodically
    function updateStatus() {
        chrome.runtime.sendMessage({action: 'getStatus', url}, response => {
            if (response) {
                statusIndicator.className = `status-indicator status-${response.status}`;
                status.textContent = `Last loaded: ${new Date(response.lastLoaded).toLocaleTimeString()}`;
            }
        });
    }
    
    updateStatus();
    setInterval(updateStatus, 5000);
}

function getStorageData(key) {
    return new Promise(resolve => {
        chrome.storage.local.get(key, resolve);
    });
}

function setStorageData(data) {
    return new Promise(resolve => {
        chrome.storage.local.set(data, resolve);
    });
}