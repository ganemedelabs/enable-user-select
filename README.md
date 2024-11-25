# Enable User Select Chrome Extension

This Chrome extension forces the `user-select` property to be enabled on all elements, allowing users to select and copy text on web pages that may have restricted text selection.

## 📋 Table of Contents

-   [Installation](#-installation)
-   [Usage](#-usage)
-   [Files](#-files)
-   [License](#-license)
-   [Contact](#-contact)

## 🔧 Installation

1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" (toggle it in the top right).
4. Click on "Load unpacked" and select the extension’s folder.

## 🚀 Usage

-   Click on the extension icon in the Chrome toolbar.
-   Use the toggle checkbox to enable or disable text selection on the current web page.
-   Default state: Enabled.

## 📁 Files

-   `popup.html`: The popup interface with the toggle button and information box.
-   `popup.css`: Styles for the popup.
-   `popup.js`: Handles popup interactions and saves the toggle state.
-   `content.js`: Applies the `user-select` CSS rules to the webpage.

## 📜 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 📧 Contact

For inquiries or more information, you can reach out to us at [ganemedelabs@gmail.com](mailto:ganemedelabs@gmail.com).
