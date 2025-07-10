/*
Gmail Rich Text Debug Script
Run this in Gmail's console to understand the editor structure
*/

function debugGmailEditor() {
    console.log("=== Gmail Rich Text Debug ===");
    
    // Find all contentEditable elements
    var contentEditables = document.querySelectorAll('[contenteditable="true"]');
    console.log("Found " + contentEditables.length + " contentEditable elements:");
    
    for (var i = 0; i < contentEditables.length; i++) {
        var element = contentEditables[i];
        console.log("Element " + i + ":");
        console.log("  - Tag:", element.tagName);
        console.log("  - ID:", element.id);
        console.log("  - Classes:", element.className);
        console.log("  - Aria-label:", element.getAttribute('aria-label'));
        console.log("  - Role:", element.getAttribute('role'));
        console.log("  - Inner HTML (first 100 chars):", element.innerHTML.substring(0, 100));
        console.log("  - Inner Text (first 100 chars):", element.innerText.substring(0, 100));
        console.log("  ---");
    }
    
    // Check for Gmail-specific selectors
    var gmailSelectors = [
        '[aria-label*="Message Body"]',
        '[aria-label*="compose"]',
        '[role="textbox"]',
        '.Am.Al.editable',
        '[g_editable="true"]',
        '.editable[contenteditable="true"]',
        '.gmail_quote',
        '.gmail_signature'
    ];
    
    console.log("\nGmail-specific elements:");
    for (var j = 0; j < gmailSelectors.length; j++) {
        var elements = document.querySelectorAll(gmailSelectors[j]);
        if (elements.length > 0) {
            console.log("Found " + elements.length + " elements for selector: " + gmailSelectors[j]);
            for (var k = 0; k < elements.length; k++) {
                console.log("  - Element " + k + " HTML:", elements[k].innerHTML.substring(0, 50));
            }
        }
    }
    
    // Check current active element
    var activeElement = document.activeElement;
    if (activeElement) {
        console.log("\nActive element:");
        console.log("  - Tag:", activeElement.tagName);
        console.log("  - ID:", activeElement.id);
        console.log("  - Classes:", activeElement.className);
        console.log("  - ContentEditable:", activeElement.isContentEditable);
        console.log("  - Aria-label:", activeElement.getAttribute('aria-label'));
    }
    
    // Test rich text detection
    console.log("\nTesting rich text content:");
    var richElements = document.querySelectorAll('b, i, u, strong, em, span[style], div[style]');
    console.log("Found " + richElements.length + " elements with potential rich formatting");
    
    return {
        contentEditables: contentEditables,
        activeElement: activeElement,
        richElements: richElements
    };
}

// Run the debug
debugGmailEditor(); 