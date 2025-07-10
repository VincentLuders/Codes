# Formalizr Rich Text Enhancement

## Overview

This enhancement adds rich text support to the Formalizr browser extension, allowing it to capture, store, and restore formatted text from contentEditable elements and rich text editors.

## What's New

### Rich Text Capture
- **ContentEditable Elements**: Captures and preserves HTML formatting (bold, italic, lists, etc.)
- **Rich Text Editors**: Detects common rich text editors (CKEditor, TinyMCE, Quill)
- **Backward Compatibility**: Still captures plain text for regular input fields

### Enhanced Clipboard Support
- **Dual Format Copy**: Copies both plain text and rich HTML to clipboard
- **Smart Paste**: When pasting into compatible applications, formatting is preserved
- **Fallback**: If rich text isn't available, falls back to plain text

### Storage Enhancement
- **Rich Text Storage**: Stores both plain text and HTML versions
- **Space Efficient**: Only stores rich text when formatting is detected
- **Version Compatible**: Works alongside existing Formalizr data

## Files Added/Modified

### New Files
- `content_richtext.js` - Enhanced content script with rich text support
- `popup_richtext.js` - Enhanced popup script with rich text clipboard support
- `test_richtext.html` - Test page for verifying rich text functionality
- `RICHTEXT_README.md` - This documentation

### Modified Files
- `popup.html` - Added rich text script inclusion
- `manifest.json` - Added new content script

## How It Works

### 1. Text Capture Process
```javascript
// For contentEditable elements
result.richText = element.innerHTML;
result.plainText = element.innerText;
result.isRich = containsRichFormatting(element.innerHTML);

// For regular inputs  
result.plainText = element.value;
result.richText = convertPlainTextToHtml(element.value);
result.isRich = false;
```

### 2. Storage Format
```javascript
{
    id: element.id,
    nm: element.name,
    tp: type,
    si: index,
    val: plainText,      // Original plain text
    richVal: richText,   // NEW: HTML content
    isRich: hasFormatting // NEW: Rich text flag
}
```

### 3. Clipboard Enhancement
```javascript
// Sets both plain text and HTML in clipboard
event.clipboardData.setData("text/plain", plainText);
event.clipboardData.setData("text/html", htmlContent);
```

## Usage Instructions

### For Users

1. **Install the Extension**: Load the modified extension in Chrome
2. **Use Rich Text Editors**: Type in any contentEditable field with formatting
3. **View Saved Data**: Click the Formalizr icon to see captured text
4. **Copy with Formatting**: Use the "Copy" link to get formatted text
5. **Paste Anywhere**: Paste into compatible apps (Word, Gmail, etc.) with formatting preserved

### For Developers

1. **Test Page**: Open `test_richtext.html` to verify functionality
2. **Debug**: Check browser console for rich text detection logs
3. **Customize**: Modify rich text detection patterns in `containsRichFormatting()`

## Rich Text Detection

The extension detects rich formatting by checking for:
- HTML tags: `<b>`, `<i>`, `<u>`, `<strong>`, `<em>`, `<span>`, `<div>`, `<p>`, `<br>`, `<ul>`, `<ol>`, `<li>`, `<h1-6>`
- Style attributes: `style="..."`
- CSS classes: `class="..."`

## Supported Rich Text Editors

- **Native contentEditable** - Full support
- **CKEditor** - Detects via `.cke_contents iframe`
- **TinyMCE** - Detects via `.mce-content-body`
- **Quill** - Detects via `.ql-editor`
- **Custom Editors** - Any `[contenteditable="true"]` element

## Compatibility

### Browser Support
- **Chrome 26+** - Full support (same as original Formalizr)
- **Edge** - Should work (Chromium-based)
- **Firefox** - Not tested (would need manifest v2 adaptation)

### Application Compatibility
Rich text paste works in:
- Microsoft Word
- Google Docs
- Gmail compose
- Outlook
- Any application supporting HTML clipboard format

## Testing

### Manual Testing Steps

1. Open `test_richtext.html` in Chrome
2. Type formatted text in the rich text editor
3. Check Formalizr popup shows the page
4. Copy the rich text using the "Copy" button
5. Paste into Word/Google Docs - formatting should be preserved

### Expected Behavior

- **Rich Text Fields**: Show formatting preserved in copies
- **Plain Text Fields**: Work exactly as before
- **Mixed Content**: Each field type handled appropriately
- **Copy All**: Combines all field data (plain text format)

## Known Limitations

1. **Complex Formatting**: Very complex CSS styles may not transfer perfectly
2. **Editor-Specific**: Some proprietary rich text editors may not be detected
3. **Large Content**: Very large HTML content increases storage usage
4. **Security**: HTML content is sanitized (scripts/iframes removed)

## Troubleshooting

### Rich Text Not Detected
- Check if the editor uses contentEditable
- Verify HTML contains detectable formatting tags
- Look for console errors in developer tools

### Copy/Paste Issues
- Ensure target application supports HTML clipboard
- Try copying individual fields vs "Copy All"
- Check clipboard permissions in browser

### Storage Problems
- Rich text increases storage usage
- Extension may hit storage limits faster
- Clear old data if storage becomes full

## Future Enhancements

Potential improvements:
- Support for more rich text editors
- Image/media content preservation
- Custom formatting rule definitions
- Rich text preview in popup
- Export to common formats (RTF, Markdown)

## Developer Notes

### Code Structure
- `gl_richtext` - Enhanced content script object
- `gl_richtext_popup` - Enhanced popup functionality
- Backward compatibility maintained throughout

### Extension Points
- `extractTextData()` - Add new editor detection
- `containsRichFormatting()` - Modify rich text detection
- `prepareHtmlForClipboard()` - Customize HTML cleanup

### Performance Considerations
- Rich text detection runs on every input change
- HTML storage uses more memory than plain text
- Clipboard operations are synchronous

---

*This enhancement maintains full backward compatibility with existing Formalizr functionality while adding powerful rich text capabilities.* 