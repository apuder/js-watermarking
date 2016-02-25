
// blacklistedIds = ["none"];

// chrome.runtime.onMessageExternal.addListener(
//   function(request, sender, sendResponse) {
//     if (sender.id in blacklistedIds) {
//       sendResponse({"result":"sorry, could not process your message"});
//       return;  // don't allow this extension access
//     } else if (request.BAclick) {
//       sendResponse({"result":"Ok, got your message"});
//       // chrome.tabs.executeScript(null, {file: "savefile.js"});
//       chrome.tabs.create({
//         "url": chrome.extension.getURL("web/web/viewer.html")
//       }); 
//     } else {
//       sendResponse({"result":"Ops, I don't understand this message"});
//     }
//   });


chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create(
  	// 'web/web/viewer.html', {
  	'website/index.html', {
    id: "host",
    innerBounds: {
      width: 800,
      height: 600,
    }
  });
});