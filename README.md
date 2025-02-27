# Teams PWA Enhancements

A Chrome extension that enhances the Microsoft Teams Progressive Web App (PWA) with two key improvements:

1. **Automatic Activity Status** - Keeps your Teams status as "Available" based on your actual system activity, similar to how Slack works. No more manually changing your status or having Teams incorrectly show you as "Away".

2. **Persistent Notifications** - Makes Teams notifications persistent by overriding Teams' default behavior of closing notifications automatically. This ensures you don't miss important messages when you're away from your computer.

## Why Use This Extension?

### Activity Status Enhancement

Teams has a frustrating behavior of marking you as "Away" after a short period of inactivity within the Teams window itself, even if you're actively working on your computer in other applications. This extension simulates activity within Teams when your system is active, maintaining your "Available" status accurately.

### Notification Improvements

Teams notifications are designed to disappear after a short time, which can cause you to miss important messages. This extension:
- Forces all Teams notifications to be persistent (requires user interaction to dismiss)
- Prevents Teams from automatically closing notifications

## Installation

### Build and Install Manually

1. Clone the repository:
   ```bash
   git clone https://github.com/therichkid/teams-pwa-enhancements.git
   cd teams-pwa-enhancements
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build the extension (choose one method):
   ```bash
   # Create a ZIP file for installation
   pnpm run package

   # OR create a CRX file for installation
   pnpm run release
   ```

4. Install in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top-right corner
   - For ZIP installation:
     - Click "Load unpacked" and select the `dist` folder
   - For CRX installation:
     - Drag and drop the generated CRX file from the `releases` folder onto the extensions page

## Usage

1. After installation, the extension will automatically run in the background
2. Open Microsoft Teams in Chrome or as a PWA
3. The extension will:
   - Keep your Teams status as "Available" when you're active on your computer
   - Make notifications persistent so they don't disappear until you interact with them

No configuration is needed! The extension works automatically with the following behaviors:
- Checks for system activity every minute
- Simulates mouse movement in Teams when you're active elsewhere on your computer
- Overrides the notification behavior on every Teams tab

## Privacy and Permissions

This extension:
- Only runs on Microsoft Teams websites (teams.microsoft.com)
- Does not collect or transmit any data
- Uses permissions only for the specific features mentioned:
  - `alarms`: For scheduling activity checks
  - `idle`: To detect system activity state
  - `notifications`: To modify notification behavior
  - `scripting`: To execute scripts in Teams tabs
  - `tabs`: To identify Teams tabs

## Development

If you want to contribute or build the extension yourself:

```bash
# Install dependencies
pnpm install

# Build the extension
pnpm run build

# Package the extension for distribution
pnpm run package

# Create a versioned release
pnpm run release
```

## License

ISC License

## Author

Richard Zille
