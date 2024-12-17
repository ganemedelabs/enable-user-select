document.addEventListener("DOMContentLoaded", () => {
    const checkbox = document.getElementById("toggle-input");
    const toggleContainer = document.querySelector(".toggle-container");
    const body = document.body;

    function updateTextSelection(enabled) {
        if (enabled) {
            body.classList.add("selectable");
        } else {
            body.classList.remove("selectable");
        }
    }

    toggleContainer.classList.add("no-transition");

    chrome.storage.sync.get("userSelectEnabled", (data) => {
        const enabled = data.userSelectEnabled !== false; // Default to enabled
        checkbox.checked = enabled;

        updateTextSelection(enabled);

        setTimeout(() => {
            toggleContainer.classList.remove("no-transition");
        }, 200);
    });

    checkbox.addEventListener("change", (event) => {
        const enabled = event.target.checked;
        chrome.storage.sync.set({ userSelectEnabled: enabled });

        updateTextSelection(enabled);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { userSelectEnabled: enabled });
        });
    });
});
