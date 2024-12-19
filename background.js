chrome.tabs.onActivated.addListener(({ tabId }) => {
    chrome.tabs.get(tabId, (tab) => {
        if (tab && tab.url && tab.url.startsWith("http")) {
            chrome.storage.sync.get("userSelectEnabled", (data) => {
                const enabled = data.userSelectEnabled !== false; // Default to enabled

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
});
