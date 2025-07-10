class PreloadManager {
    constructor() {
        this.preloadedSites = new Map();  // URL -> {lastLoaded, content}
        this.initializeFromStorage();
        this.startPreloadInterval();
    }

    async initializeFromStorage() {
        const data = await this.getStorageData('sites');
        if (data.sites) {
            data.sites.forEach(site => this.preloadSite(site));
        }
    }

    startPreloadInterval() {
        // Refresh preloaded content every 5 minutes
        setInterval(() => {
            this.preloadedSites.forEach((data, url) => {
                this.preloadSite(url);
            });
        }, 300000);
    }

    async getStorageData(key) {
        return new Promise(resolve => {
            chrome.storage.local.get(key, resolve);
        });
    }

    async preloadSite(url) {
        try {
            const response = await fetch(url, {
                mode: 'no-cors',
                credentials: 'omit'
            });
            
            if (response.ok) {
                this.preloadedSites.set(url, {
                    lastLoaded: Date.now(),
                    status: 'loaded'
                });
                console.log(`Preloaded: ${url}`);
            }
        } catch (error) {
            console.error(`Failed to preload ${url}:`, error);
            this.preloadedSites.set(url, {
                lastLoaded: Date.now(),
                status: 'error'
            });
        }
    }

    getPreloadStatus(url) {
        return this.preloadedSites.get(url);
    }
}

const preloadManager = new PreloadManager();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'preload':
            preloadManager.preloadSite(request.url);
            break;
        case 'getStatus':
            sendResponse(preloadManager.getPreloadStatus(request.url));
            break;
        case 'openTab':
            chrome.tabs.create({ url: request.url });
            break;
    }
    return true;
});