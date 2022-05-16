// When dapplink button is clicked, open dapp in new tab
dapplink.addEventListener("click", async () => {
    chrome.runtime.sendMessage('deactivateicon', () => {
        // Have to call tabs.create after sendMessage or else the message will not alway be sent
        var newURL = "https://localhost:3000/";
        chrome.tabs.create({ url: newURL });
    });
});