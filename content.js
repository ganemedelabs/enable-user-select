/**
 * @fileoverview Content script for unlocking text selection and right-click menus.
 * Injected at document_start to catch elements before they render.
 */

// ==========================================
// 1. CONFIGURATION & CONSTANTS
// ==========================================

const TARGET_SELECTORS = `
    html, html *, body, body *,
    article, section, main, aside, header, footer, nav, figure, figcaption, blockquote, q, img,
    p, span, div, b, em, i, a, strong, sub, sup, small, cite, dfn, abbr, kbd, samp, var, del, ins, s, u,
    h1, h2, h3, h4, h5, h6, label, legend, summary, details, code, pre, mark, time,
    ul, ol, li, dl, dt, dd, table, caption, tbody, tfoot, thead, tr, th, td,
    *, *::before, *::after
`.trim();

const CSS_RULES = `
    -webkit-user-select: text !important;
    -moz-user-select: text !important;
    -ms-user-select: text !important;
    user-select: text !important;
`;

const FULL_STYLES = `${TARGET_SELECTORS} { \n${CSS_RULES}\n}`;

const RESTRICTIVE_EVENTS = ["copy", "cut", "paste", "select", "selectstart", "contextmenu", "dragstart"];

const baseStyle = document.createElement("style");
baseStyle.id = "userSelectBase";
baseStyle.textContent = FULL_STYLES;

const aggressiveStyle = document.createElement("style");
aggressiveStyle.id = "userSelectAggressive";
aggressiveStyle.textContent = FULL_STYLES;

let protectionObserver = null;

// ==========================================
// 2. CORE DOM MANIPULATION
// ==========================================

/**
 * Safely appends a style element to the head or document element.
 * @param {HTMLElement} styleEl
 */
function safeInjectStyle(styleEl) {
    const parent = document.head || document.documentElement;
    if (parent && !parent.contains(styleEl)) parent.appendChild(styleEl);
}

/**
 * Stops event propagation for events typically used to block selection.
 * @param {Document|ShadowRoot} root
 */
function unlockEvents(root = document) {
    RESTRICTIVE_EVENTS.forEach((evt) => {
        root.addEventListener(
            evt,
            (e) => {
                e.stopPropagation();
                e.stopImmediatePropagation();
            },
            true,
        );
    });
}

/**
 * Recursively traverses nodes to unlock Shadow DOMs.
 * @param {Node} node
 */
function unlockShadow(node) {
    if (!node) return;

    if (node.shadowRoot) {
        unlockEvents(node.shadowRoot);
        const st = document.createElement("style");
        st.textContent = FULL_STYLES;
        node.shadowRoot.appendChild(st);
    }

    if (node.childNodes) node.childNodes.forEach((c) => unlockShadow(c));
}

/**
 * Ensures CSS is reapplied if removed by page scripts and monitors new nodes.
 * @param {HTMLElement} styleEl
 */
function aggressiveCSSProtection(styleEl) {
    if (protectionObserver) protectionObserver.disconnect();

    protectionObserver = new MutationObserver((mutations) => {
        safeInjectStyle(styleEl);

        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) unlockShadow(node);
            }
        }
    });

    protectionObserver.observe(document.documentElement || document, {
        childList: true,
        subtree: true,
    });
}

/**
 * Main toggle logic for applying or removing extensions rules.
 * @param {boolean} enabled
 * @param {boolean} aggressive
 */
function applySettings(enabled, aggressive) {
    [baseStyle, aggressiveStyle].forEach((s) => {
        if (s.parentNode) s.parentNode.removeChild(s);
    });

    if (protectionObserver) {
        protectionObserver.disconnect();
        protectionObserver = null;
    }

    if (!enabled) return;

    safeInjectStyle(baseStyle);

    if (aggressive) {
        safeInjectStyle(aggressiveStyle);
        unlockEvents(document);
        unlockShadow(document.documentElement);
        aggressiveCSSProtection(aggressiveStyle);
    }
}

// ==========================================
// 3. SNAPSHOT GENERATOR
// ==========================================

/**
 * Clones the page, removes scripts/restrictions, and returns clean HTML.
 * @returns {string} Cleaned HTML string
 */
function generateCleanSnapshot() {
    const clone = document.documentElement.cloneNode(true);

    let base = clone.querySelector("head base");
    if (!base) {
        base = document.createElement("base");
        const head = clone.querySelector("head") || clone;
        head.insertBefore(base, head.firstChild);
    }
    base.href = window.location.href;

    clone.querySelectorAll("script, noscript, iframe").forEach((el) => el.remove());

    clone.querySelectorAll("*").forEach((el) => {
        Array.from(el.attributes).forEach((attr) => {
            if (attr.name.startsWith("on")) el.removeAttribute(attr.name);
        });
        el.style.setProperty("user-select", "text", "important");
        el.style.setProperty("-webkit-user-select", "text", "important");
        el.style.setProperty("pointer-events", "auto", "important");
    });

    return clone.outerHTML;
}

// ==========================================
// 4. INITIALIZATION & EVENT LISTENERS
// ==========================================

chrome.storage.sync.get(["userSelectEnabled", "aggressiveMode"], (data) => {
    applySettings(data.userSelectEnabled !== false, data.aggressiveMode === true);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    switch (msg.action) {
        case "PING":
            sendResponse({ status: "PONG" });
            break;

        case "CAPTURE_CLEAN_PAGE":
            try {
                sendResponse({ html: generateCleanSnapshot(), title: document.title });
            } catch (err) {
                console.error("Snapshot generation failed:", err);
                sendResponse({ error: err.message });
            }
            break;

        default:
            if (msg.userSelectEnabled !== undefined || msg.aggressiveMode !== undefined) {
                chrome.storage.sync.get(["userSelectEnabled", "aggressiveMode"], (data) => {
                    applySettings(data.userSelectEnabled !== false, data.aggressiveMode === true);
                    sendResponse({ status: "settings_applied" });
                });
                return true;
            }
    }
});
