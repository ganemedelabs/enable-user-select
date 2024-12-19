function updateIcon(enabled) {
    const iconPath = enabled ? "images/icon-48.png" : "images/icon-48-disabled.png";
    chrome.action.setIcon({ path: iconPath });
}

function getUserSelectEnabled(callback) {
    chrome.storage.sync.get("userSelectEnabled", (data) => {
        const enabled = data.userSelectEnabled !== false; // Default to enabled
        callback(enabled);
    });
}

function handleTabActivation(tabId) {
    chrome.tabs.get(tabId, (tab) => {
        if (tab && tab.url && tab.url.startsWith("http")) {
            getUserSelectEnabled((enabled) => {
                updateIcon(enabled);

                chrome.tabs.sendMessage(tabId, { userSelectEnabled: enabled }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.warn("Message not delivered to tab:", chrome.runtime.lastError.message);
                    }
                });
            });
        } else {
            console.log("Skipped unsupported tab:", tab?.url);
        }
    });
}

getUserSelectEnabled(updateIcon);

chrome.tabs.onActivated.addListener(({ tabId }) => {
    handleTabActivation(tabId);
});
