# Enable User Select

![Code size](https://custom-icon-badges.demolab.com/github/languages/code-size/ganemedelabs/enable-user-select?logo=file-code&logoColor=white)
![JavaScript](https://custom-icon-badges.demolab.com/badge/JavaScript-Vanilla-F7DF1E.svg?logo=javascript&logoColor=white)
![License](https://custom-icon-badges.demolab.com/github/license/ganemedelabs/enable-user-select?logo=law)

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/enable-user-select/hipjlflbbjaojdoecdgbelgofbfckpai)

<!--
[![Microsoft Edge Add-ons](https://img.shields.io/badge/Edge-Add--ons-0078D7?logo=edge&logoColor=white)]()
[![Firefox Add-ons](https://img.shields.io/badge/Firefox-Add--ons-FF7139?logo=firefoxbrowser&logoColor=white)]()
-->

[![Userscript](https://img.shields.io/badge/Userscript-supported-00485B?logo=tampermonkey&logoColor=white)](#userscript)
[![Bookmarklet](https://img.shields.io/badge/Bookmarklet-supported-F7DF1E?logo=mark&logoColor=white)](#bookmarklet)
[![Xcode build](https://img.shields.io/badge/Xcode-Safari%20build-147EFB?logo=xcode&logoColor=white)](#safari-extension-macos--ios)

Forces the `user-select` property to be enabled on all elements, so you can select and copy text on web pages that restrict it. It is available as a Chrome extension, a Safari extension (built with Xcode), a userscript, and a bookmarklet.

## 📋 Table of Contents

- [Installation](#-installation)
    - [Chrome, Edge & Firefox](#chrome-edge--firefox)
    - [Safari extension (macOS & iOS)](#safari-extension-macos--ios)
    - [Userscript](#userscript)
    - [Bookmarklet](#bookmarklet)
- [Usage](#-usage)
- [Limitations](#-limitations)
- [Building the Safari extension](#-building-the-safari-extension)
- [License](#-license)
- [Contact](#-contact)

## 🔧 Installation

### Chrome, Edge & Firefox

Install from the store for your browser:

- [Chrome Web Store](https://chromewebstore.google.com/detail/enable-user-select/hipjlflbbjaojdoecdgbelgofbfckpai)

<!--
- [Microsoft Edge Add-ons]()
- [Firefox Add-ons]()
-->

Manual install (Chrome / Edge / other Chromium browsers):

1. Clone or download this repository.
2. Open `chrome://extensions/` (or `edge://extensions/` in Edge).
3. Enable "Developer mode" (toggle it in the top right).
4. Click on "Load unpacked" and select the extension’s folder.

### Safari extension (macOS & iOS)

Safari only runs signed extensions, so the Safari version is distributed as an Xcode project that you build yourself. This needs a Mac with Xcode (a free Apple ID is enough for your own devices).

1. Download `safari-xcode-project-v*.zip` from the [latest release](../../releases/latest) and unzip it.
2. Open the `.xcodeproj` in Xcode.
3. For both the app target and the extension target, go to Signing & Capabilities and choose your Team.
4. Choose the macOS or iOS scheme, then press Run.
5. In Safari, open Settings → Extensions, enable Enable User Select, and choose Always Allow on Every Website so it can run on pages.
6. If you only have a free Apple ID on macOS, also enable Develop → Allow Unsigned Extensions (turn on the Develop menu under Settings → Advanced). Safari resets this each time it quits.

No Mac? Use the [userscript](#userscript) and [bookmarklet](#bookmarklet) instead.

### Userscript

The userscript runs at page load, so it works on most pages without any taps.

#### Safari (macOS & iOS):

1. Install [Userscripts](https://apps.apple.com/app/userscripts/id1463298887) from the App Store and follow its setup (choose a scripts folder, enable it in Safari → Settings → Extensions, and allow it on all websites).
2. Open [`enable-user-select.user.js`](https://raw.githubusercontent.com/ganemedelabs/enable-user-select/main/enable-user-select.user.js) in Safari, tap the Userscripts icon in the address bar, and tap Install.

#### Other browsers:

open the same link with Tampermonkey or another userscript manager installed and confirm the install.

### Bookmarklet

The bookmarklet adds a small control panel to the current page. GitHub does not allow clickable `javascript:` links, so you copy it into a bookmark yourself:

1. Open [`bookmarklet.txt`](bookmarklet.txt) and copy the entire line (it starts with `javascript:`).
2. Create a bookmark for any page:
    - Safari on Mac: Bookmarks → Add Bookmark, then Bookmarks → Edit Bookmarks, right-click the bookmark, choose Edit Address, and paste.
    - Safari on iPhone / iPad: tap Share → Add Bookmark, then open Bookmarks, tap Edit, tap the bookmark, and paste into the address field.
3. Name it something like `Enable User Select` and save.

## 🚀 Usage

### Chrome and Safari extension

- Click on the extension icon in the browser toolbar.
- Use the toggle checkbox to enable or disable text selection on the current web page.
- Enable aggressive mode to unblock sites that use JavaScript to disable selection. Use only if normal mode doesn't work because this may break some interactive pages.
- Click Copy Page to New Tab to capture a clean, script-free snapshot of the current page into a sandboxed new tab—perfect for websites where aggressive mode still fails to bypass anti-copy protections.

### Userscript

- It unlocks selection automatically on every `http`/`https` page.
- Tampermonkey (and managers with a script menu): open the manager's menu on the page and choose Toggle text selection on/off, Toggle aggressive mode, or Capture clean page.
- Safari Userscripts app: it has no script menu, so the defaults apply (selection unlocked, aggressive mode off). To change them for a site, use the [bookmarklet](#bookmarklet) panel on that site: the userscript reads the same per-site setting on the next page load.

### Bookmarklet

1. Open a page where text selection is blocked and tap the bookmark. Selection is unlocked right away and the panel appears in the top-right corner.
2. In the panel:
    - Enable text selection turns the unlock on or off.
    - Aggressive mode (on by default for the bookmarklet) also blocks the page's own copy/select/right-click handlers. Turn it off if it breaks the page.
    - Capture clean page opens a script-free snapshot of the page in a new tab.
    - × hides the panel. Tap the bookmark again to show or hide it.
3. Your choices are remembered per site.

## ⚠️ Limitations

- Bookmarklet: it runs only when tapped, after the page has loaded, so it cannot undo anything a site did earlier. Sites with a strict Content-Security-Policy may block the injected styles.
- Safari extension: needs a Mac to build; unsigned builds can't be installed from a download.
- Aggressive mode can break interactive pages (custom menus, games, editors). Turn it off on those sites.
- Capture clean page copies what the page currently shows. Content that loads after you capture it, and anything inside iframes, is not included.

## 🏗️ Building the Safari extension

A GitHub Actions workflow ([`.github/workflows/safari-extension.yml`](.github/workflows/safari-extension.yml)) converts the extension into an Xcode project on a macOS runner:

- Push a tag such as `v2.2.2`, or run the workflow manually from the Actions tab.
- It checks that the project compiles and attaches `safari-xcode-project-v*.zip` to the GitHub Release for that tag.
- Maintainers with a paid Apple Developer account can also enable the optional TestFlight job: set the repository variable `ENABLE_APPSTORE` to `true` and add the secrets `APPLE_TEAM_ID`, `ASC_KEY_ID`, `ASC_ISSUER_ID` and `ASC_KEY_P8`.

## 📜 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 📧 Contact

For inquiries or more information, you can reach out to us at [ganemedelabs@gmail.com](mailto:ganemedelabs@gmail.com).
