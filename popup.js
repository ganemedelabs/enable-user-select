document.addEventListener("DOMContentLoaded", () => {
    const checkbox = document.getElementById("main-toggle");
    const aggressiveBox = document.getElementById("aggressive-toggle");

    function update(enabled, aggressive) {
        chrome.action.setIcon({
            path: enabled ? "images/icon-48.png" : "images/icon-48-disabled.png",
        });

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                userSelectEnabled: enabled,
                aggressiveMode: aggressive,
            });
        });
    }

    chrome.storage.sync.get(["userSelectEnabled", "aggressiveMode"], (data) => {
        checkbox.checked = data.userSelectEnabled !== false;
        aggressiveBox.checked = data.aggressiveMode === true;
        update(checkbox.checked, aggressiveBox.checked);
    });

    checkbox.addEventListener("change", () => {
        chrome.storage.sync.set({ userSelectEnabled: checkbox.checked });
        update(checkbox.checked, aggressiveBox.checked);
    });

    aggressiveBox.addEventListener("change", () => {
        chrome.storage.sync.set({ aggressiveMode: aggressiveBox.checked });
        update(checkbox.checked, aggressiveBox.checked);
    });
});
