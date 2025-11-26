const baseStyle = document.createElement("style");
baseStyle.id = "userSelectBase";
baseStyle.textContent = `
    * {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
    }
`;

function unlockEvents(root = document) {
    const events = [
        "copy",
        "cut",
        "paste",
        "select",
        "selectstart",
        "mousedown",
        "mouseup",
        "mousemove",
        "contextmenu",
        "dragstart",
        "keydown",
    ];

    events.forEach((evt) => {
        root.addEventListener(
            evt,
            (e) => {
                e.stopPropagation();
                e.stopImmediatePropagation();
            },
            true
        );
    });
}

function unlockShadow(node) {
    if (!node) return;

    if (node.shadowRoot) {
        unlockEvents(node.shadowRoot);

        const st = document.createElement("style");
        st.textContent = `
            * {
                user-select: text !important;
                pointer-events: auto !important;
            }
        `;
        node.shadowRoot.appendChild(st);
    }

    node.childNodes.forEach((c) => unlockShadow(c));
}

function aggressiveCSSProtection(styleEl) {
    const obs = new MutationObserver(() => {
        if (!document.head.contains(styleEl)) {
            document.head.appendChild(styleEl);
        }
    });

    obs.observe(document.documentElement, { childList: true, subtree: true });
}

const aggressiveStyle = document.createElement("style");
aggressiveStyle.id = "userSelectAggressive";
aggressiveStyle.textContent = `
    * {
        -webkit-user-select: text !important;
        user-select: text !important;
        pointer-events: auto !important;
    }
`;

function applySettings(enabled, aggressive) {
    [baseStyle, aggressiveStyle].forEach((s) => {
        if (document.head.contains(s)) document.head.removeChild(s);
    });

    if (!enabled) return;

    document.head.appendChild(baseStyle);

    if (aggressive) {
        document.head.appendChild(aggressiveStyle);

        unlockEvents(document);
        unlockShadow(document);

        aggressiveCSSProtection(aggressiveStyle);
    }
}

chrome.storage.sync.get(["userSelectEnabled", "aggressiveMode"], (data) => {
    applySettings(data.userSelectEnabled !== false, data.aggressiveMode === true);
});

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.userSelectEnabled !== undefined || msg.aggressiveMode !== undefined) {
        chrome.storage.sync.get(["userSelectEnabled", "aggressiveMode"], (data) => {
            applySettings(data.userSelectEnabled !== false, data.aggressiveMode === true);
        });
    }
});
