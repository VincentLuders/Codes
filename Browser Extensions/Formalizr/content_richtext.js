/*
Formalizr Rich Text Enhancement
Extension of original Formalizr to support rich text formatting
*/

// Enhanced global object with rich text support
gl_richtext = {
    // Original settings preserved
    gSettings: {
        nCollectFlgs: 268435455,
        nCollectMax: 128,
        bCollectData: true,
        bIncogCollectData: true
    },

    // Enhanced text collection with rich text support
    collectAllFormData: function() {
        var collectedData = [];
        var collectStatus = 1;
        
        try {
            var flags = this.gSettings.nCollectFlgs;
            
            // Collect from input elements
            if (flags & 252) {
                var inputs = document.getElementsByTagName("input");
                if (inputs) {
                    for (var i = 0; i < inputs.length; i++) {
                        var element = inputs[i];
                        var type = this.isObjAcceptable(element, flags);
                        if (type) {
                            if (this.isElmtCollectable(element)) {
                                var textData = this.extractTextData(element);
                                if (textData && !this.isWhitespaceEmptyString(textData.plainText)) {
                                    if (collectedData.length >= this.gSettings.nCollectMax) {
                                        collectStatus = 0;
                                        break;
                                    }
                                    collectedData.push({
                                        id: element.id,
                                        nm: element.name,
                                        tp: type,
                                        si: i,
                                        val: textData.plainText,
                                        richVal: textData.richText, // NEW: Rich text storage
                                        isRich: textData.isRich      // NEW: Rich text flag
                                    });
                                }
                            }
                        }
                    }
                }
            }
            
            // Collect from textarea elements
            if (flags & 1) {
                var textareas = document.getElementsByTagName("textarea");
                if (textareas) {
                    var baseIndex = 65536;
                    for (var i = 0; i < textareas.length; i++) {
                        var element = textareas[i];
                        var type = this.isObjAcceptable(element, flags);
                        if (type) {
                            if (this.isElmtCollectable(element)) {
                                var textData = this.extractTextData(element);
                                if (textData && !this.isWhitespaceEmptyString(textData.plainText)) {
                                    if (collectedData.length >= this.gSettings.nCollectMax) {
                                        collectStatus = 0;
                                        break;
                                    }
                                    collectedData.push({
                                        id: element.id,
                                        nm: element.name,
                                        tp: type,
                                        si: baseIndex + i,
                                        val: textData.plainText,
                                        richVal: textData.richText,
                                        isRich: textData.isRich
                                    });
                                }
                            }
                        }
                    }
                }
            }
            
            // Collect from contentEditable elements
            if (flags & 2) {
                var allElements = document.getElementsByTagName("*");
                if (allElements) {
                    var baseIndex = 131072;
                    for (var i = 0; i < allElements.length; i++) {
                        var element = allElements[i];
                        if (element.isContentEditable || this.isGmailEditor(element)) {
                            if (this.isElmtCollectable(element)) {
                                var textData = this.extractTextData(element);
                                if (textData && !this.isWhitespaceEmptyString(textData.plainText)) {
                                    if (collectedData.length >= this.gSettings.nCollectMax) {
                                        collectStatus = 0;
                                        break;
                                    }
                                    collectedData.push({
                                        id: element.id,
                                        nm: element.name,
                                        tp: ">ce",
                                        si: baseIndex + i,
                                        val: textData.plainText,
                                        richVal: textData.richText,
                                        isRich: textData.isRich
                                    });
                                }
                            }
                        }
                    }
                }
            }
        } catch (ex) {
            collectStatus = -1;
            this.logExceptionReport(100, ex);
        }
        
        return { dt: collectedData, rs: collectStatus };
    },

    // NEW: Enhanced text extraction with rich text support
    extractTextData: function(element) {
        var result = {
            plainText: "",
            richText: "",
            isRich: false
        };
        
        try {
            if (element.isContentEditable) {
                // For contentEditable elements, capture HTML content
                result.richText = element.innerHTML;
                result.plainText = element.innerText || element.textContent || "";
                result.isRich = this.containsRichFormatting(element.innerHTML);
            } else if (element.tagName === "TEXTAREA") {
                // For textareas, check if they contain rich text (some editors use textareas)
                result.plainText = element.value;
                // Some rich text editors use textareas with hidden formatting
                var richEditor = this.findAssociatedRichEditor(element);
                if (richEditor) {
                    result.richText = richEditor.innerHTML;
                    result.isRich = this.containsRichFormatting(richEditor.innerHTML);
                } else {
                    result.richText = this.convertPlainTextToHtml(element.value);
                    result.isRich = false;
                }
            } else {
                // For regular input elements
                result.plainText = element.value;
                result.richText = this.convertPlainTextToHtml(element.value);
                result.isRich = false;
            }
        } catch (ex) {
            this.logExceptionReport(101, ex);
            result.plainText = element.value || element.innerText || "";
            result.richText = this.convertPlainTextToHtml(result.plainText);
            result.isRich = false;
        }
        
        return result;
    },

    // NEW: Check if HTML contains rich formatting
    containsRichFormatting: function(html) {
        if (!html) return false;
        
        // Check for rich formatting tags (including Gmail-specific ones)
        var richTags = /<(b|i|u|strong|em|span|div|p|br|ul|ol|li|h[1-6]|font)[^>]*>/i;
        var hasStyleAttr = /style\s*=\s*["'][^"']*["']/i;
        var hasClassAttr = /class\s*=\s*["'][^"']*["']/i;
        
        // Gmail-specific formatting checks
        var gmailFormatting = /font-weight\s*:\s*bold|font-style\s*:\s*italic|text-decoration\s*:\s*underline/i;
        var gmailClasses = /gmail_/i;
        
        return richTags.test(html) || 
               hasStyleAttr.test(html) || 
               hasClassAttr.test(html) ||
               gmailFormatting.test(html) ||
               gmailClasses.test(html);
    },

    // NEW: Convert plain text to HTML with line breaks
    convertPlainTextToHtml: function(text) {
        if (!text) return "";
        return text.replace(/\n/g, "<br>").replace(/\r/g, "");
    },

    // NEW: Find associated rich text editor for textarea
    findAssociatedRichEditor: function(textarea) {
        // Look for common rich text editor patterns
        var parent = textarea.parentElement;
        if (parent) {
            // Check for Gmail first (very specific structure)
            var gmailEditor = this.findGmailEditor(textarea);
            if (gmailEditor) return gmailEditor;
            
            // Check for other common editors
            var richEditor = parent.querySelector('.cke_contents iframe') ||
                            parent.querySelector('.mce-content-body') ||
                            parent.querySelector('.ql-editor') ||
                            parent.querySelector('[contenteditable="true"]');
            return richEditor;
        }
        return null;
    },

    // NEW: Specific Gmail editor detection
    findGmailEditor: function(textarea) {
        // Gmail uses multiple possible editor structures
        var gmailSelectors = [
            '[contenteditable="true"][aria-label*="compose"]',
            '[contenteditable="true"][aria-label*="Message Body"]',
            '[contenteditable="true"][role="textbox"]',
            '.Am.Al.editable',
            '[g_editable="true"]',
            '.editable[contenteditable="true"]'
        ];
        
        // Search in wider scope for Gmail editors
        var searchRoot = document;
        for (var i = 0; i < gmailSelectors.length; i++) {
            var editor = searchRoot.querySelector(gmailSelectors[i]);
            if (editor) {
                console.log('[RichText] Found Gmail editor:', gmailSelectors[i]);
                return editor;
            }
        }
        
        return null;
    },

    // Enhanced fill function with rich text support
    fillAllFormData: function(formData) {
        var success = false;
        
        try {
            var isIframe = window != window.top;
            var frameKey;
            
            if (isIframe) {
                frameKey = this.get_iframeIndex() + ">" + document.URL;
                frameKey = frameKey ? frameKey.toString().toLowerCase() : "";
            } else {
                frameKey = ".";
            }
            
            for (var key in formData) {
                var pageKey = key ? key.toString().toLowerCase() : "";
                if (pageKey == frameKey) {
                    var pageData = formData[key];
                    for (var i = 0; i < pageData.length; i++) {
                        var found = false;
                        var item = pageData[i];
                        
                        // Try to fill input elements
                        var inputs = document.getElementsByTagName("input");
                        if (inputs) {
                            for (var j = 0; j < inputs.length; j++) {
                                var element = inputs[j];
                                if (j == item.si && 
                                    this.isSameStrNoCase(element.id, item.id) &&
                                    this.isSameStrNoCase(element.name, item.nm) &&
                                    this.isSameStrNoCase(element.type, item.tp)) {
                                    found = true;
                                    // Use rich text if available, otherwise plain text
                                    element.value = item.richVal && item.isRich ? 
                                        this.convertHtmlToPlainText(item.richVal) : item.v;
                                    break;
                                }
                            }
                        }
                        
                        if (found) continue;
                        
                        // Try to fill textarea elements
                        if (item.tp == "textarea") {
                            var textareas = document.getElementsByTagName("textarea");
                            if (textareas) {
                                var baseIndex = 65536;
                                for (var j = 0; j < textareas.length; j++) {
                                    var element = textareas[j];
                                    if ((baseIndex + j) == item.si &&
                                        this.isSameStrNoCase(element.id, item.id) &&
                                        this.isSameStrNoCase(element.name, item.nm)) {
                                        found = true;
                                        
                                        // Check for associated rich text editor
                                        var richEditor = this.findAssociatedRichEditor(element);
                                        if (richEditor && item.richVal && item.isRich) {
                                            richEditor.innerHTML = item.richVal;
                                        } else {
                                            element.value = item.v;
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                        
                        if (found) continue;
                        
                        // Try to fill contentEditable elements
                        if (item.tp == ">ce") {
                            var allElements = document.getElementsByTagName("*");
                            if (allElements) {
                                var baseIndex = 131072;
                                for (var j = 0; j < allElements.length; j++) {
                                    var element = allElements[j];
                                    if (element.isContentEditable) {
                                        if ((baseIndex + j) == item.si &&
                                            this.isSameStrNoCase(element.id, item.id) &&
                                            this.isSameStrNoCase(element.name, item.nm)) {
                                            // Use rich text for contentEditable elements
                                            if (item.richVal && item.isRich) {
                                                element.innerHTML = item.richVal;
                                            } else {
                                                element.innerText = item.v;
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            success = true;
        } catch (ex) {
            success = false;
            this.logExceptionReport(119, ex);
        }
        
        return success;
    },

    // NEW: Convert HTML to plain text safely
    convertHtmlToPlainText: function(html) {
        if (!html) return "";
        
        // Create a temporary div to safely extract text
        var temp = document.createElement("div");
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || "";
    },

    // Preserve original utility functions
    isAutocompleteOff: function(element) {
        var autocomplete = element.autocomplete;
        if (autocomplete && autocomplete.toLowerCase() == "off") {
            return true;
        }
        if (element.form) {
            autocomplete = element.form.autocomplete;
            if (autocomplete && autocomplete.toLowerCase() == "off") {
                return true;
            }
        }
        return false;
    },

    isElmtCollectable: function(element) {
        if (element.__frmlzrColl92) {
            return true;
        }
        if (!element.__frmlzrSet93) {
            element.addEventListener("input", this._OnElmtInput, true);
            element.__frmlzrSet93 = true;
        }
        return false;
    },

    _OnElmtInput: function(event) {
        if (event.target.__frmlzrColl92) {
            return;
        }
        event.target.__frmlzrColl92 = true;
        event.target.removeEventListener("input", gl_richtext._OnElmtInput, true);
        chrome.runtime.sendMessage({action: "reqUpdate01"});
    },

    isObjAcceptable: function(element, flags) {
        var result = null;
        if (element && (!(flags & 65536) || element.id || element.name)) {
            if (element.readOnly !== true) {
                if (element.nodeName == "INPUT") {
                    var type = element.type;
                    if (type) {
                        type = type.toLowerCase();
                        if (((flags & 4) && type == "text") ||
                            ((flags & 8) && type == "email") ||
                            ((flags & 16) && type == "number") ||
                            ((flags & 32) && type == "search") ||
                            ((flags & 64) && type == "tel") ||
                            ((flags & 128) && type == "url")) {
                            if ((flags & 131072) || !this.isAutocompleteOff(element)) {
                                result = type;
                            }
                        }
                    }
                } else if ((flags & 1) && element.nodeName == "TEXTAREA") {
                    if ((flags & 131072) || !this.isAutocompleteOff(element)) {
                        result = "textarea";
                    }
                }
            }
        }
        return result;
    },

    isWhitespaceEmptyString: function(str) {
        return str ? !(/\S/.test(str)) : (str === "" || str === null || str === undefined);
    },

    isSameStrNoCase: function(str1, str2) {
        if (str1) {
            if (str2) {
                if (str1.substring) {
                    if (str2.substring) {
                        return str1.toLowerCase() == str2.toLowerCase();
                    } else {
                        return str1.toLowerCase() == str2.toString().toLowerCase();
                    }
                } else {
                    if (str2.substring) {
                        return str1.toString().toLowerCase() == str2.toLowerCase();
                    } else {
                        return str1.toString().toLowerCase() == str2.toString().toLowerCase();
                    }
                }
            }
        } else {
            if (!str2) {
                if ((str1 === "" || str1 === null || str1 === undefined) &&
                    (str2 === "" || str2 === null || str2 === undefined)) {
                    return true;
                }
            }
        }
        return false;
    },

    get_iframeIndex: function() {
        return this._iframeIndex_recurs(window);
    },

    _iframeIndex_recurs: function(win) {
        var result = "";
        var topWindow = window.top;
        if (win == topWindow) {
            return result;
        }
        var parent = win.parent;
        if (parent != topWindow) {
            result = this._iframeIndex_recurs(parent) + "_";
        }
        var frames = parent.frames;
        for (var i = 0; i < frames.length; i++) {
            if (frames[i] == win) {
                return result + i;
            }
        }
        return result + "?";
    },

    // NEW: Check if element is a Gmail editor
    isGmailEditor: function(element) {
        if (!element) return false;
        
        // Check for Gmail editor attributes
        var gmailAttributes = [
            'aria-label',
            'role',
            'g_editable',
            'contenteditable'
        ];
        
        for (var i = 0; i < gmailAttributes.length; i++) {
            var attr = element.getAttribute(gmailAttributes[i]);
            if (attr) {
                attr = attr.toLowerCase();
                if (attr.indexOf('compose') !== -1 || 
                    attr.indexOf('message') !== -1 || 
                    attr.indexOf('textbox') !== -1 ||
                    attr === 'true') {
                    return true;
                }
            }
        }
        
        // Check for Gmail CSS classes
        var className = element.className;
        if (className && typeof className === 'string') {
            return className.indexOf('editable') !== -1 || 
                   className.indexOf('Am') !== -1 ||
                   className.indexOf('Al') !== -1;
        }
        
        return false;
    },

    logExceptionReport: function(code, exception) {
        var message = "ERROR(" + code + "): ";
        if (exception.stack) {
            message += exception.stack;
        } else {
            message += exception.message;
        }
        console.error("[RichText] " + message);
    }
};

// Replace the original gl object with our enhanced version
if (typeof gl !== 'undefined') {
    // Preserve any existing functionality and merge with rich text features
    for (var key in gl) {
        if (typeof gl_richtext[key] === 'undefined') {
            gl_richtext[key] = gl[key];
        }
    }
}

// Set the enhanced object as the main one
gl = gl_richtext; 