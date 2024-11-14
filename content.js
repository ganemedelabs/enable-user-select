function applyUserSelect(enable) {
    if (enable) {
        if (!document.head.contains(style)) {
            document.head.appendChild(style);
        }
    } else {
        if (document.head.contains(style)) {
            document.head.removeChild(style);
        }
    }
}

const style = document.createElement("style");
style.innerHTML = `
    * {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
    }
`;

// Load the initial state from storage and apply
chrome.storage.sync.get("userSelectEnabled", (data) => {
    applyUserSelect(data.userSelectEnabled !== false); // default to enabled
});

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message) => {
    if (message.userSelectEnabled !== undefined) {
        applyUserSelect(message.userSelectEnabled);
    }
});
