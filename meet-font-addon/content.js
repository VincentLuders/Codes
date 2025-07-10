// Content script for SF Pro Font Meet extension
// This runs automatically on Google Meet pages

(async function() {
    'use strict';
    
    console.log('SF Pro Font extension loaded on Google Meet');
    
    // Check if styles are enabled
    const result = await chrome.storage.sync.get(['fontEnabled']);
    const fontEnabled = result.fontEnabled || false;
    
    if (fontEnabled) {
        applyFontStyles();
    }
    
    // Listen for storage changes to apply/remove styles dynamically
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'sync' && changes.fontEnabled) {
            if (changes.fontEnabled.newValue) {
                applyFontStyles();
            } else {
                removeFontStyles();
            }
        }
    });
    
    function applyFontStyles() {
        console.log('Applying SF Pro font styles...');
        
        // Remove existing style if it exists
        removeFontStyles();
        
        const style = document.createElement('style');
        style.id = 'sf-pro-font-styles';
        
        // Much more conservative approach - only target specific content areas
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
        console.log('SF Pro font styles applied successfully');
        
        // Log what we're seeing for debugging
        const icons = document.querySelectorAll('.google-symbols');
        console.log(`Found ${icons.length} Google Symbols icons`);
        icons.forEach((icon, i) => {
            if (i < 3) {
                console.log(`Icon ${i}: text="${icon.textContent}", classes="${icon.className}"`);
            }
        });
    }
    
    function removeFontStyles() {
        const existingStyle = document.getElementById('sf-pro-font-styles');
        if (existingStyle) {
            existingStyle.remove();
            console.log('SF Pro font styles removed');
        }
    }
    
    // Also monitor for dynamically added content
    const observer = new MutationObserver((mutations) => {
        // Check if we need to reapply styles
        const styleElement = document.getElementById('sf-pro-font-styles');
        if (styleElement && !document.head.contains(styleElement)) {
            const result = chrome.storage.sync.get(['fontEnabled']);
            if (result.fontEnabled) {
                console.log('Styles were removed by Meet, reapplying...');
                applyFontStyles();
            }
        }
    });
    
    // Start observing when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.documentElement, {
                childList: true,
                subtree: true
            });
        });
    } else {
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }
})(); 