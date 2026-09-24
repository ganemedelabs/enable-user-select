/**
 * @fileoverview Handles UI interactions within the extension popup.
 */

document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. INITIALIZATION & i18n
    // ==========================================

    document.documentElement.lang = chrome.i18n.getUILanguage();
    document.documentElement.dir = chrome.i18n.getMessage("@@bidi_dir");

    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const localizedMessage = chrome.i18n.getMessage(element.getAttribute("data-i18n"));
        if (localizedMessage) element.textContent = localizedMessage;
    });

    const ui = {
        checkbox: document.getElementById("main-toggle"),
        aggressiveBox: document.getElementById("aggressive-toggle"),
        captureBtn: document.getElementById("capture-btn"),
    };

    // ==========================================
    // 2. STATE UPDATES
    // ==========================================

    /**
     * Enables/disables the aggressive-mode checkbox based on the main toggle.
     * @param {boolean} enabled
     */
    function syncAggressiveAvailability(enabled) {
        ui.aggressiveBox.disabled = !enabled;
        ui.aggressiveBox.closest("label")?.classList.toggle("disabled", !enabled);
    }

    /**
     * Broadcasts state changes to the background script and active tab.
     * @param {boolean} enabled
     * @param {boolean} aggressive
     */
    function broadcastState(enabled, aggressive) {
        chrome.action.setIcon({
            path: enabled ? "images/icon-48.png" : "images/icon-48-disabled.png",
        });

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {
                        userSelectEnabled: enabled,
                        aggressiveMode: aggressive,
                    },
                    () => chrome.runtime.lastError,
                );
            }
        });
    }

    chrome.storage.sync.get(["userSelectEnabled", "aggressiveMode"], (data) => {
        ui.checkbox.checked = data.userSelectEnabled !== false;
        ui.aggressiveBox.checked = data.aggressiveMode === true;
        syncAggressiveAvailability(ui.checkbox.checked);
        broadcastState(ui.checkbox.checked, ui.aggressiveBox.checked);
    });

    ui.checkbox.addEventListener("change", () => {
        chrome.storage.sync.set({ userSelectEnabled: ui.checkbox.checked });
        syncAggressiveAvailability(ui.checkbox.checked);
        broadcastState(ui.checkbox.checked, ui.aggressiveBox.checked);
    });

    ui.aggressiveBox.addEventListener("change", () => {
        chrome.storage.sync.set({ aggressiveMode: ui.aggressiveBox.checked });
        broadcastState(ui.checkbox.checked, ui.aggressiveBox.checked);
    });

    // ==========================================
    // 3. PAGE CAPTURE LOGIC
    // ==========================================

    if (ui.captureBtn) {
        ui.captureBtn.addEventListener("click", async () => {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab?.id) return alert("No active tab found.");
            if (!tab.url || !tab.url.startsWith("http")) {
                return alert("Cannot capture internal browser pages (e.g., chrome:// or Chrome Web Store).");
            }

            chrome.tabs.sendMessage(tab.id, { action: "PING" }, async () => {
                if (chrome.runtime.lastError) {
                    try {
                        await chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            files: ["content.js"],
                        });
                        setTimeout(() => executeCapture(tab), 150);
                    } catch (err) {
                        console.warn("Script injection failed. Switching to raw background fetch...", err);
                        fallbackToRawFetch(tab);
                    }
                } else executeCapture(tab);
            });
        });
    }

    function executeCapture(tab) {
        chrome.tabs.sendMessage(tab.id, { action: "CAPTURE_CLEAN_PAGE" }, (response) => {
            if (chrome.runtime.lastError || !response?.html) return fallbackToRawFetch(tab);
            openViewer(response.html, response.title || tab.title);
        });
    }

    function fallbackToRawFetch(tab) {
        chrome.runtime.sendMessage({ action: "FETCH_RAW_PAGE", url: tab.url }, (response) => {
            if (response?.html) openViewer(response.html, tab.title || "Captured Page");
            else alert("Could not capture page content via script or background fetch.");
        });
    }

    function openViewer(html, title) {
        chrome.runtime.sendMessage({ action: "OPEN_VIEWER", html, title });
    }
});
