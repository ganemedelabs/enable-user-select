/**
 * @fileoverview Retrieves the captured page HTML from local storage
 * and renders it safely inside an isolated iframe.
 */

document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(["capturedHTML", "capturedTitle"], (data) => {
        const frame = document.getElementById("clean-frame");

        if (data.capturedTitle) document.title = `Clean View: ${data.capturedTitle}`;
        else document.title = "Clean View";

        if (data.capturedHTML) {
            frame.srcdoc = data.capturedHTML;
            chrome.storage.local.remove(["capturedHTML", "capturedTitle"]);
        } else {
            frame.srcdoc = `
                <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif; padding: 2rem; text-align: center;">
                    <h2>No content found</h2>
                    <p>Please return to the original page and try capturing it again.</p>
                </div>
            `;
        }
    });
});
