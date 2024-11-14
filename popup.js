document.addEventListener("DOMContentLoaded", () => {
    const checkbox = document.getElementById("toggle-input");

    // Load the saved state of the checkbox
    chrome.storage.sync.get("userSelectEnabled", (data) => {
        checkbox.checked = data.userSelectEnabled !== false; // default to enabled
    });

    // Listen for changes to the checkbox and update storage
    checkbox.addEventListener("change", (event) => {
        const enabled = event.target.checked;
        chrome.storage.sync.set({ userSelectEnabled: enabled });

        // Send a message to content script to update the setting
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { userSelectEnabled: enabled });
        });
    });
});
