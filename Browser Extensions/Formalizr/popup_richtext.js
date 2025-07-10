/*
Formalizr Rich Text Popup Enhancement
Extension of original popup to support rich text copying
*/

// Enhanced clipboard functionality with rich text support
gl_richtext_popup = {
    
    // Enhanced clipboard copy with rich text support
    clipboardCopyText: function(content, isPlainText, richContent) {
        try {
            var success = false;
            
            if (!content) content = "";
            
            // Apply newline replacements if not plain text mode
            if (isPlainText !== false) {
                content = this.replaceNewLines(content);
            }
            
            // Enhanced copy function that supports both plain text and rich text
            document.oncopy = function(event) {
                try {
                    // Always set plain text
                    event.clipboardData.setData("text/plain", content.toString());
                    
                    // Set rich text if available
                    if (richContent && typeof richContent === 'string' && richContent.trim()) {
                        // Convert our stored HTML to properly formatted rich text
                        var htmlContent = gl_richtext_popup.prepareHtmlForClipboard(richContent);
                        event.clipboardData.setData("text/html", htmlContent);
                    }
                    
                    event.preventDefault();
                    success = true;
                } catch (ex) {
                    gl.logExceptionReport(312, ex);
                }
            };
            
            document.execCommand("Copy", false, null);
            document.oncopy = undefined;
            
            return success;
        } catch (ex) {
            gl.logExceptionReport(109, ex);
            return false;
        }
    },

    // NEW: Prepare HTML content for clipboard
    prepareHtmlForClipboard: function(htmlContent) {
        if (!htmlContent) return "";
        
        // Wrap content in a proper HTML structure for clipboard
        var wrappedHtml = '<div>' + htmlContent + '</div>';
        
        // Clean up any potential issues
        wrappedHtml = wrappedHtml.replace(/<script[^>]*>.*?<\/script>/gi, '');
        wrappedHtml = wrappedHtml.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
        
        return wrappedHtml;
    },

    // Enhanced item copy with rich text support
    onItemCopyClicked: function(pageID, linkID, textBoxID, linkType) {
        var textElement = document.getElementById(textBoxID);
        if (textElement) {
            // Get the stored data to check for rich text
            var pageData = gl.oAccPages[pageID];
            if (pageData) {
                var storage = gl.getCopyMemoryStorageObject();
                var pageInfo = storage[pageData.url];
                if (pageInfo) {
                    // Find the corresponding rich text data
                    var richContent = this.findRichTextForElement(pageID, textBoxID, pageInfo);
                    
                    // Copy with both plain and rich text
                    if (this.clipboardCopyText(textElement.value, true, richContent)) {
                        var linkElement = document.getElementById(linkID);
                        if (linkElement) {
                            linkElement.innerText = gl.encodeHtml(chrome.i18n.getMessage("lnk_done"));
                            setTimeout(function() {
                                linkElement.innerText = gl.encodeHtml(chrome.i18n.getMessage("lnk_copy"));
                            }, 900);
                        }
                    }
                    return;
                }
            }
            
            // Fallback to original functionality
            if (this.clipboardCopyText(textElement.value, true)) {
                var linkElement = document.getElementById(linkID);
                if (linkElement) {
                    linkElement.innerText = gl.encodeHtml(chrome.i18n.getMessage("lnk_done"));
                    setTimeout(function() {
                        linkElement.innerText = gl.encodeHtml(chrome.i18n.getMessage("lnk_copy"));
                    }, 900);
                }
            }
        }
    },

    // NEW: Find rich text content for a specific element
    findRichTextForElement: function(pageID, textBoxID, pageInfo) {
        try {
            var pageData = gl.oAccPages[pageID];
            if (!pageData || !pageData.tbxs) return null;
            
            // Extract the element identifier from the textBoxID
            var idParts = textBoxID.split('_');
            if (idParts.length < 3) return null;
            
            var elementKey = idParts.slice(2).join('_'); // Remove "idTbx_" or "idTA_" prefix
            
            // Find the matching textbox data
            for (var i = 0; i < pageData.tbxs.length; i++) {
                var tbxData = pageData.tbxs[i];
                var expectedKey = gl.encodeHtml(
                    tbxData.tbxID + tbxData.tbx.si.toString() + tbxData.tbxGInd.toString()
                );
                
                if (expectedKey === elementKey) {
                    // Get the current time slider value
                    var rangeElement = document.getElementById("idRange_" + pageID);
                    var timeIndex = rangeElement ? parseInt(rangeElement.value, 10) : 0;
                    
                    // Find the rich text for this time
                    var timeData = gl._lookupBestMatchTxTm(timeIndex, pageData.tms, tbxData.tbx.tx);
                    
                    // Look for rich text in the original storage
                    return this.findRichTextInStorage(pageInfo, tbxData.tbxID, timeData.tm);
                }
            }
        } catch (ex) {
            gl.logExceptionReport(401, ex);
        }
        
        return null;
    },

    // NEW: Find rich text in storage data
    findRichTextInStorage: function(pageInfo, tbxID, timestamp) {
        try {
            for (var frameKey in pageInfo.frms) {
                var frameData = pageInfo.frms[frameKey];
                if (frameData[tbxID]) {
                    var textHistory = frameData[tbxID].tx;
                    for (var i = 0; i < textHistory.length; i++) {
                        var textEntry = textHistory[i];
                        if (textEntry.tm === timestamp && textEntry.richVal) {
                            return textEntry.richVal;
                        }
                    }
                }
            }
        } catch (ex) {
            gl.logExceptionReport(402, ex);
        }
        
        return null;
    },

    // Enhanced copy all functionality with rich text
    onPageTbButton_CopyAll: function(pageID, event) {
        var content = "";
        
        try {
            var pageData = gl.oAccPages[pageID];
            if (pageData) {
                var storage = gl.getCopyMemoryStorageObject();
                var pageInfo = storage[pageData.url];
                if (pageInfo) {
                    var newLine = gl.getNewLine();
                    var includeDebugInfo = !!event.shiftKey;
                    var savedMsg = chrome.i18n.getMessage("msg_saved");
                    var moreDataMsg = chrome.i18n.getMessage("msg_more_txbxs_available");
                    
                    // Add page title and URL
                    if (pageInfo.ttl) {
                        content += '"' + pageInfo.ttl + '"' + newLine;
                    }
                    if (pageData.url) {
                        content += pageData.url + newLine;
                    }
                    
                    // Add debug info if requested
                    if (includeDebugInfo) {
                        if (pageInfo.fav) {
                            content += "FavIcon: " + pageInfo.fav + newLine;
                        }
                        content += "Flgs: 0x" + pageInfo.flg.toString(16) + newLine;
                    }
                    
                    content += savedMsg + " " + (pageInfo.tm !== null ? 
                        gl.formatDateTimeFromTicks(gl.convertFromUTCTicks(pageInfo.tm)) : "") + newLine;
                    content += newLine;
                    
                    var rangeElement = document.getElementById("idRange_" + pageID);
                    if (rangeElement) {
                        var timeIndex = parseInt(rangeElement.value, 10);
                        var times = pageData.tms;
                        
                        if (times && timeIndex >= 0 && timeIndex < times.length) {
                            if (!includeDebugInfo) {
                                // Simple format with rich text support
                                var tbxData = pageData.tbxs;
                                if (tbxData && tbxData.length > 0) {
                                    for (var i = 0; i < tbxData.length; i++) {
                                        var tbx = tbxData[i].tbx;
                                        var timeData = gl._lookupBestMatchTxTm(timeIndex, times, tbx.tx);
                                        
                                        content += "-------------------------------" + newLine;
                                        
                                        var fieldName = tbx.nm || tbx.id;
                                        if (fieldName) {
                                            content += "[" + fieldName + "]" + newLine;
                                        }
                                        
                                        content += savedMsg + " " + (timeData.tm !== null ? 
                                            gl.formatDateTimeFromTicks(gl.convertFromUTCTicks(timeData.tm)) : "") + newLine;
                                        content += newLine;
                                        
                                        // Try to get rich text, fallback to plain text
                                        var richText = this.findRichTextInStorage(pageInfo, tbxData[i].tbxID, timeData.tm);
                                        var textContent = timeData.txt ? gl.replaceNewLines(timeData.txt) : "";
                                        
                                        content += textContent;
                                        content += newLine + newLine;
                                    }
                                }
                            } else {
                                // Detailed debug format
                                for (var frameKey in pageInfo.frms) {
                                    var frameInfo = gl.extractIframeInfo(frameKey);
                                    content += "+++++++++++++++++++++++++++++++" + newLine;
                                    content += "IFrame: " + frameInfo.url + newLine;
                                    if (frameInfo.idx) {
                                        content += "IIndex: " + frameInfo.idx + newLine;
                                    }
                                    content += newLine;
                                    
                                    for (var tbxKey in pageInfo.frms[frameKey]) {
                                        var tbx = pageInfo.frms[frameKey][tbxKey];
                                        var timeData = gl._lookupBestMatchTxTm(timeIndex, times, tbx.tx);
                                        
                                        content += "-------------------------------" + newLine;
                                        content += 'ID: "' + (tbx.id ? tbx.id : "") + '"' + newLine;
                                        content += 'Name: "' + (tbx.nm ? tbx.nm : "") + '"' + newLine;
                                        content += 'TbxId: "' + tbxKey + '"' + newLine;
                                        content += 'Type: "' + (tbx.tp ? tbx.tp : "") + '"' + newLine;
                                        content += "OSI: 0x" + tbx.osi.toString(16) + newLine;
                                        content += "SI: 0x" + tbx.si.toString(16) + newLine;
                                        content += savedMsg + " " + (timeData.tm !== null ? 
                                            gl.formatDateTimeFromTicks(gl.convertFromUTCTicks(timeData.tm)) : "") + newLine;
                                        content += newLine;
                                        content += timeData.txt ? gl.replaceNewLines(timeData.txt) : "";
                                        content += newLine + newLine;
                                    }
                                }
                            }
                            
                            if (pageInfo.flg & 1) {
                                content += "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" + newLine;
                                content += moreDataMsg + newLine;
                            }
                            
                            // Copy the content (this will be plain text for "copy all")
                            if (this.clipboardCopyText(content, false)) {
                                // Success handled by the copy function
                            }
                        }
                    }
                }
            }
        } catch (ex) {
            gl.logExceptionReport(114, ex);
        }
    },

    // Preserve original utility functions and add to gl if needed
    replaceNewLines: function(text) {
        return gl.replaceNewLines ? gl.replaceNewLines(text) : text;
    }
};

// Extend the original gl object with rich text popup functions
if (typeof gl !== 'undefined') {
    // Override specific functions
    gl.clipboardCopyText = gl_richtext_popup.clipboardCopyText;
    gl.onItemCopyClicked = gl_richtext_popup.onItemCopyClicked;
    gl.onPageTbButton_CopyAll = gl_richtext_popup.onPageTbButton_CopyAll;
    
    // Add new functions
    gl.prepareHtmlForClipboard = gl_richtext_popup.prepareHtmlForClipboard;
    gl.findRichTextForElement = gl_richtext_popup.findRichTextForElement;
    gl.findRichTextInStorage = gl_richtext_popup.findRichTextInStorage;
} 