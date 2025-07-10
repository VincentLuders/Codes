document.addEventListener('DOMContentLoaded', async () => {
    const toggleButton = document.getElementById('toggleFont');
    const statusText = document.getElementById('statusText');
    const statusIndicator = document.getElementById('statusIndicator');
    const warning = document.getElementById('warning');
    
    let fontEnabled = false;
    
    // Check if we're on a Meet tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    
    if (!currentTab.url.includes('meet.google.com')) {
        warning.style.display = 'block';
        toggleButton.disabled = true;
        return;
    }
    
    // Load saved state
    const result = await chrome.storage.sync.get(['fontEnabled']);
    fontEnabled = result.fontEnabled || false;
    updateUI();
    
    // If already enabled, refresh the styles
    if (fontEnabled) {
        await applyFontStyles();
    }
    
    toggleButton.addEventListener('click', async () => {
        fontEnabled = !fontEnabled;
        
        // Save state
        await chrome.storage.sync.set({ fontEnabled });
        
        // Apply or remove styles
        if (fontEnabled) {
            await applyFontStyles();
        } else {
            await removeFontStyles();
        }
        
        updateUI();
    });
    
    function updateUI() {
        if (fontEnabled) {
            toggleButton.textContent = 'Disable SF Pro Font';
            toggleButton.classList.add('active');
            statusText.textContent = 'SF Pro font is enabled';
            statusIndicator.classList.add('active');
        } else {
            toggleButton.textContent = 'Apply SF Pro Font';
            toggleButton.classList.remove('active');
            statusText.textContent = 'Font styling is disabled';
            statusIndicator.classList.remove('active');
        }
    }
    
    async function applyFontStyles() {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: currentTab.id },
                func: injectStyles
            });
        } catch (error) {
            console.error('Failed to apply font styles:', error);
        }
    }
    
    async function removeFontStyles() {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: currentTab.id },
                func: removeStyles
            });
        } catch (error) {
            console.error('Failed to remove font styles:', error);
        }
    }
});

// Functions that will be injected into the Meet page
function injectStyles() {
    console.log('Injecting SF Pro font styles from popup...');
    
    // Remove existing style if it exists
    const existingStyle = document.getElementById('sf-pro-font-styles-popup');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    const style = document.createElement('style');
    style.id = 'sf-pro-font-styles-popup';
    
    // Same conservative approach as content.js
    style.textContent = `
        /* Only apply to chat messages and captions */
        [jsname="xySENc"],
        [jsname="Ypafjf"],
        div[jsname="tgaKEf"],
        .z38b6,
        .CYZUZd,
        .GDhqjd,
        .Mz6pEf,
        .TBMuR {
            font-family: "SF Pro", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        
        /* Participant names */
        .KV1GEc,
        .ZjFb7c {
            font-family: "SF Pro", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        
        /* Settings and menu text */
        .VfPpkd-rymPhb-fpDzbe-fmcmS,
        .VfPpkd-rymPhb-L8ivfd-fmcmS {
            font-family: "SF Pro", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        
        /* Ensure icons are NEVER affected */
        .google-symbols,
        .material-icons,
        .material-symbols-outlined,
        i[class*="google-symbols"],
        i[class*="material"],
        i.google-symbols,
        .VfPpkd-kBDsod,
        [aria-label*="mic"],
        [aria-label*="camera"],
        [aria-label*="present"],
        [aria-label*="hand"],
        [aria-label*="more"] {
            font-family: "Google Symbols", "Material Icons" !important;
        }
    `;
    
    document.head.appendChild(style);
    console.log('SF Pro font styles applied from popup');
}

function removeStyles() {
    const existingStyle = document.getElementById('sf-pro-font-styles-popup');
    if (existingStyle) {
        existingStyle.remove();
        console.log('SF Pro font styles removed from popup');
    }
} 