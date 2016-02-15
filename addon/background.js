/*
Add openMyPage() as a listener to clicks on the browser action.
*/
// chrome.browserAction.onClicked.addListener(open_js_watermarking);

/*
Open a new tab, and load "js-watermarking.html" into it.
*/
function open_js_watermarking() {
	chrome.tabs.create({
	  "url": chrome.extension.getURL("addon/js-watermarking.html")
	});
}


function handle_request(request) {
  console.log(request);
}

var port = 3000; //whatever is your port
const {Cc, Ci} = require("chrome");
var serverSocket = Cc["@mozilla.org/network/server-socket;1"].createInstance(Ci.nsIServerSocket);
serverSocket.init(port, true, -1);
var listener = {
  onSocketAccepted: function(socket, transport) {
    var input = transport.openInputStream(Ci.nsITransport.OPEN_BLOCKING,0,0);
    var output = transport.openOutputStream(Ci.nsITransport.OPEN_BLOCKING, 0, 0);
    var tm = Cc["@mozilla.org/thread-manager;1"].getService();
    input.asyncWait({
      onInputStreamReady: function(inp) {
        try
        {
          var sin = Cc["@mozilla.org/scriptableinputstream;1"].createInstance(Ci.nsIScriptableInputStream);
          sin.init(inp);
          sin.available();

          //Get request message
          var request = '';
          while (sin.available()) { request = request + sin.read(5120); }
          var reqObj = { type: null, info: [] };
          if(request != null && request.trim() != "") {
            handle_request(request);
          }
        }
        catch(ex) { }           
        finally
        {
          sin.close();
          input.close();
          output.close();
        }
      }
    }, 0, 0, tm.mainThread);
  },
  onStopListening: function(socket, status) {
  }
};
serverSocket.asyncListen(listener);
