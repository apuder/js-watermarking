 /*
 Add openMyPage() as a listener to clicks on the browser action.
 */
 chrome.browserAction.onClicked.addListener(open_js_watermarking);
 
 /*
 Open a new tab, and load "js-watermarking.html" into it.
 */
 function open_js_watermarking() {
    chrome.tabs.create({
      "url": chrome.extension.getURL("addon/js-watermarking.html")
    }); 
 }
 