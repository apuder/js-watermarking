
blacklistedIds = ["none"];

chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    if (sender.id in blacklistedIds) {
      sendResponse({"result":"sorry, could not process your message"});
      return;  // don't allow this extension access
    } else if (request.BAclick) {
      sendResponse({"result":"Ok, got your message"});
      chrome.tabs.executeScript(null, {file: "savefile.js"});
    } else {
      sendResponse({"result":"Ops, I don't understand this message"});
    }
  });

