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

chrome.storage.sync.get("userSelectEnabled", (data) => {
    applyUserSelect(data.userSelectEnabled !== false); // default to enabled
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.userSelectEnabled !== undefined) {
        applyUserSelect(message.userSelectEnabled);
    }
});
