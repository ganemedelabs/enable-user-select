// ==UserScript==
// @name         Enable User Select
// @namespace    ganemedelabs
// @version      2.2.2
// @description  Re-enables text selection and copy on restrictive pages, with optional aggressive mode and clean page snapshot.
// @match        http://*/*
// @match        https://*/*
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @downloadURL  https://raw.githubusercontent.com/ganemedelabs/enable-user-select/main/enable-user-select.user.js
// @updateURL    https://raw.githubusercontent.com/ganemedelabs/enable-user-select/main/enable-user-select.user.js
// ==/UserScript==

(() => {
    "use strict";

    // ---------- Settings ----------
    // Managers that support GM_* (e.g. Tampermonkey) store settings with GM_getValue/GM_setValue
    // and get a menu. Safari's Userscripts app has neither, so there the script reads the same
    // per-site localStorage key that the bookmarklet's control panel writes ("__unlockSelection").
    const hasGM = typeof GM_getValue === "function" && typeof GM_setValue === "function";
    const LS_KEY = "__unlockSelection";

    const readLocal = () => {
        try {
            return JSON.parse(localStorage.getItem(LS_KEY)) || {};
        } catch {
            return {};
        }
    };

    const get = (gmKey, lsKey, fallback) => {
        if (hasGM) {
            try {
                return GM_getValue(gmKey, fallback);
            } catch {
                return fallback;
            }
        }
        const v = readLocal()[lsKey];
        return typeof v === "boolean" ? v : fallback;
    };

    const set = (gmKey, lsKey, value) => {
        if (hasGM) {
            try {
                GM_setValue(gmKey, value);
            } catch {}
            return;
        }
        try {
            localStorage.setItem(LS_KEY, JSON.stringify({ ...readLocal(), [lsKey]: value }));
        } catch {}
    };

    let enabled = get("userSelectEnabled", "enabled", true);
    let aggressive = get("aggressiveMode", "aggressive", false);

    // ---------- Constants ----------
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
    const EVENTS = ["copy", "cut", "select", "selectstart"];

    const baseStyle = document.createElement("style");
    baseStyle.id = "userSelectBase";
    baseStyle.textContent = FULL_STYLES;

    const aggressiveStyle = document.createElement("style");
    aggressiveStyle.id = "userSelectAggressive";
    aggressiveStyle.textContent = FULL_STYLES;

    let observer = null;
    const stopper = (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
    };

    // ---------- Core ----------
    function inject(styleEl) {
        const parent = document.head || document.documentElement;
        if (parent && !parent.contains(styleEl)) parent.appendChild(styleEl);
    }

    function unlockEvents(root) {
        EVENTS.forEach((evt) => root.addEventListener(evt, stopper, true));
    }

    function removeEvents(root) {
        EVENTS.forEach((evt) => root.removeEventListener(evt, stopper, true));
    }

    function unlockShadow(node) {
        if (!node) return;
        if (node.shadowRoot) {
            unlockEvents(node.shadowRoot);
            if (!node.shadowRoot.querySelector("style[data-unlock]")) {
                const st = document.createElement("style");
                st.dataset.unlock = "1";
                st.textContent = FULL_STYLES;
                node.shadowRoot.appendChild(st);
            }
        }
        node.childNodes && node.childNodes.forEach(unlockShadow);
    }

    function protect(styleEl) {
        observer?.disconnect();
        observer = new MutationObserver((mutations) => {
            inject(styleEl);
            for (const m of mutations)
                for (const n of m.addedNodes) if (n.nodeType === Node.ELEMENT_NODE) unlockShadow(n);
        });
        observer.observe(document.documentElement || document, { childList: true, subtree: true });
    }

    function apply() {
        [baseStyle, aggressiveStyle].forEach((s) => s.remove());
        observer?.disconnect();
        observer = null;
        removeEvents(document);

        if (!enabled) return;
        inject(baseStyle);
        if (!baseStyle.isConnected) document.addEventListener("DOMContentLoaded", apply, { once: true });

        if (aggressive) {
            inject(aggressiveStyle);
            unlockEvents(document);
            unlockShadow(document.documentElement);
            protect(aggressiveStyle);
        }
    }

    // ---------- Snapshot ----------
    function cleanSnapshot() {
        const clone = document.documentElement.cloneNode(true);

        let base = clone.querySelector("head base");
        if (!base) {
            base = document.createElement("base");
            (clone.querySelector("head") || clone).prepend(base);
        }
        base.href = location.href;

        clone.querySelectorAll("script, noscript, iframe").forEach((el) => el.remove());
        clone.querySelectorAll("*").forEach((el) => {
            [...el.attributes].forEach((a) => a.name.startsWith("on") && el.removeAttribute(a.name));
            el.style.setProperty("user-select", "text", "important");
            el.style.setProperty("-webkit-user-select", "text", "important");
            el.style.setProperty("pointer-events", "auto", "important");
        });
        return "<!DOCTYPE html>" + clone.outerHTML;
    }

    function openSnapshot() {
        const blob = new Blob([cleanSnapshot()], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        if (!window.open(url, "_blank")) location.href = url;
    }

    // ---------- Menu ----------
    if (typeof GM_registerMenuCommand === "function" && window.top === window) {
        GM_registerMenuCommand("Toggle text selection on/off", () => {
            enabled = !enabled;
            set("userSelectEnabled", "enabled", enabled);
            apply();
            alert("Enable text selection: " + (enabled ? "ON" : "OFF"));
        });
        GM_registerMenuCommand("Toggle aggressive mode", () => {
            aggressive = !aggressive;
            set("aggressiveMode", "aggressive", aggressive);
            apply();
            alert("Aggressive mode: " + (aggressive ? "ON" : "OFF"));
        });
        GM_registerMenuCommand("Capture clean page", openSnapshot);
    }

    apply();
})();
