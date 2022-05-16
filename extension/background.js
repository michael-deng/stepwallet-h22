var newMsgs = 0; // Number of new HCS messages
var lastMsgTime = 0; // When the last HCS message came in
var clearMsgTime = Date.now(); // The last time you cleared new HCS messages by clicking the dapplink

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === 'deactivateicon') {
        deactivateIcon();
    }
    clearMsgTime = Date.now();
    newMsgs = 0;
    sendResponse();
});

function deactivateIcon() {
    chrome.action.setIcon({
        path: "/images/inactive-icon-48.png"
    });
    chrome.action.setBadgeText({
        text: ""
    });
}

function activateIcon(numNotifications) {
    chrome.action.setIcon({
        path: "/images/active-icon-48.png"
    });
    chrome.action.setBadgeText({
        text: newMsgs.toString()
    });
}

function pollHCSServer() {
    fetch("https://6ab5-2603-800c-3340-9491-d4a5-ca63-3306-50f1.jp.ngrok.io").then(r => r.text()).then(msg => {
        if (msg) {
            try {
                var msgObj = JSON.parse(msg);
                if (msgObj.time) {
                    var msgTime = msgObj.time;

                    // If the message is new and arrived after the last time you cleared HCS messages
                    if (msgTime > lastMsgTime && msgTime > clearMsgTime) {
                        lastMsgTime = msgTime;
                        newMsgs = newMsgs + 1;
                        activateIcon(newMsgs);
                    }
                }
            } catch {}
        }
    });
    setTimeout(pollHCSServer, 1000);
}

pollHCSServer();