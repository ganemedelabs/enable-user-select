/**
 * @fileoverview Background service worker for managing extension state,
 * icon updates, and fallback page fetching.
 */

// ==========================================
// 1. STATE MANAGEMENT
// ==========================================

/**
 * Updates the extension toolbar icon based on the enabled state.
 * @param {boolean} enabled
 */
function updateIcon(enabled) {
    const iconPath = enabled ? "images/icon-48.png" : "images/icon-48-disabled.png";
    chrome.action.setIcon({ path: iconPath });
}

/**
 * Retrieves the main enable toggle state.
 * @param {function} callback
 */
function getUserSelectEnabled(callback) {
    chrome.storage.sync.get("userSelectEnabled", (data) => {
        callback(data.userSelectEnabled !== false);
    });
}

/**
 * Syncs the icon and notifies the tab when it becomes active.
 * @param {number} tabId
 */
function handleTabActivation(tabId) {
    chrome.tabs.get(tabId, (tab) => {
        if (tab && tab.url && tab.url.startsWith("http")) {
            getUserSelectEnabled((enabled) => {
                updateIcon(enabled);
                chrome.tabs.sendMessage(tabId, { userSelectEnabled: enabled }, () => {
                    if (chrome.runtime.lastError) {
                        console.warn("Message not delivered to tab:", chrome.runtime.lastError.message);
                    }
                });
            });
        }
    });
}

// ==========================================
// 2. EVENT LISTENERS
// ==========================================

getUserSelectEnabled(updateIcon);

chrome.tabs.onActivated.addListener(({ tabId }) => handleTabActivation(tabId));

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "OPEN_VIEWER") {
        chrome.storage.local.set(
            {
                capturedHTML: msg.html,
                capturedTitle: msg.title,
            },
            () => {
                chrome.tabs.create({ url: "viewer.html" });
            },
        );
        return false;
    }

    if (msg.action === "FETCH_RAW_PAGE") {
        fetch(msg.url)
            .then((res) => res.text())
            .then((html) => {
                const baseTag = `<base href="${msg.url}">`;
                const cleanHtml = html.includes("<head>") ? html.replace("<head>", `<head>${baseTag}`) : baseTag + html;

                sendResponse({ html: cleanHtml });
            })
            .catch((err) => sendResponse({ error: err.message }));

        return true;
    }
});
