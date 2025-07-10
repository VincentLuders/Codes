# SF Pro Font for Google Meet - Chrome Extension

This Chrome extension applies the SF Pro font to the Google Meet interface while preserving all Google Meet icons and functionality.

## Features

- ✅ Applies SF Pro font to Meet interface text
- ✅ Preserves Google Symbols and Material Icons
- ✅ Maintains full Meet functionality
- ✅ Easy toggle on/off via popup
- ✅ Works with Arc browser and other Chromium browsers
- ✅ Automatic application when enabled
- ✅ No CSP conflicts or security issues

## Installation

### Method 1: Load as Unpacked Extension (Developer Mode)

1. **Enable Developer Mode**:
   - Open Chrome/Arc and go to `chrome://extensions/`
   - Toggle "Developer mode" in the top right
   
2. **Load the Extension**:
   - Click "Load unpacked"
   - Select the `meet-font-addon` folder
   - The extension will appear in your extensions list

3. **Test the Extension**:
   - Open Google Meet: `https://meet.google.com`
   - Click the extension icon in the toolbar
   - Click "Apply SF Pro Font" to enable

### Method 2: Package and Install

1. **Package the Extension**:
   - Go to `chrome://extensions/`
   - Click "Pack extension"
   - Select the `meet-font-addon` folder
   - This creates a `.crx` file

2. **Install the Package**:
   - Drag the `.crx` file to the extensions page
   - Click "Add extension"

## How It Works

This extension uses a **surgical approach** to apply fonts:

1. **Targeted CSS Selectors**: Only applies to specific Google Meet UI elements (chat, captions, participant names)
2. **Icon Protection**: Explicitly sets icon fonts to preserve Google Symbols
3. **Mutation Observer**: Monitors for Google Meet removing our styles and reapplies them
4. **Dual Injection**: Uses both content script and popup for redundancy

## Compatibility

- ✅ Arc Browser
- ✅ Google Chrome
- ✅ Microsoft Edge
- ✅ Brave Browser
- ✅ Any Chromium-based browser

## Why This Works vs. Stylus

Unlike Stylus or other CSS injection tools, this Chrome extension:

- **Bypasses CSP restrictions** by running as a proper extension
- **Has direct page access** without security limitations
- **Preserves icon fonts** with precise targeting
- **Integrates properly** with Chrome's extension system
- **Works in popup windows** and iframe contexts

## File Structure

```
meet-font-addon/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup interface
├── popup.js              # Popup logic and controls
├── content.js            # Main content script
├── styles.css            # Base CSS (minimal)
├── icons/                # Extension icons
└── README.md            # This file
```

## Development

To modify the font styles:

1. Edit the CSS in `content.js` within the `applyFontStyles()` function
2. Reload the extension in `chrome://extensions/`
3. Test on Google Meet

## Troubleshooting

### Extension Not Working
- Make sure you're on `meet.google.com`
- Check that the extension is enabled
- Try disabling and re-enabling the font

### Icons Still Breaking
- Open browser console and look for errors
- Try updating the icon exclusion selectors in `content.js`

### CSP Errors
- This extension should not have CSP issues
- If you see CSP errors, they're likely from other extensions

## Contributing

Feel free to improve the icon detection or add more font options!

## License

MIT License - feel free to modify and distribute. 