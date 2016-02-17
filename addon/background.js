/*
Add openMyPage() as a listener to clicks on the browser action.
*/
chrome.browserAction.onClicked.addListener(doExportToDisk);

// var jsw_on = false;

// function toggle_js_watermarking() {
//   if (jsw_on) {
//     stop_js_watermarking();
//   } else {
//     start_js_watermarking();
//   }
//   jsw_on = !jsw_on;
// }

// var tcpServer;
// var addr = '127.0.0.1';
// var port = 3000;

// function start_js_watermarking() {
//   if (tcpServer) {
//     tcpServer.disconnect();
//   }
//   tcpServer = new TcpServer(addr, port);
//   tcpServer.listen(onAcceptCallback);
//   console.log("jsw on");
// }

// function stop_js_watermarking() {
//   if (tcpServer) {
//     tcpServer.disconnect();
//     tcpServer=null;
//   }
//   console.log("jsw off");
// }

// function handle_request(request) {
//   console.log(request);
// }

// function onAcceptCallback(tcpConnection, socketInfo) {

//   console.log(socketInfo);

//   tcpConnection.addDataReceivedListener(function(data) {

//     var info="["+socketInfo.peerAddress+":"+socketInfo.peerPort+"] "+data;
//     console.log.output(info);

//     // var cmd=line.split(/\s+/);

//     // try {
//     //   tcpConnection.sendMessage(Commands.run(cmd[0], cmd.slice(1)));
//     // } catch (ex) {
//     //   tcpConnection.sendMessage(ex);
//     // }
//   });
// };

// function try_save() {
//   save_file('yay.txt');
// }

// function save_file(filename) {
//   chrome.fileSystem.chooseEntry({type: 'saveFile', 
//                                  suggestedName: filename}, 
//                                 function(writableFileEntry) {
//     writableFileEntry.createWriter(function(writer) {
//       writer.write(new Blob("yay",
//                             {type: 'text/plain'}));
//     }, on_err);
//   });
// }

// function on_err() {
//   console.log("File Writing Error");
// }








function doExportToDisk() {

  chrome.fileSystem.chooseEntry( {
    type: 'saveFile',
    suggestedName: 'todos.txt',
    accepts: [ { description: 'Text files (*.txt)',
                 extensions: ['txt']} ],
    acceptsAllTypes: true
  }, exportToFileEntry);
}

function exportToFileEntry(fileEntry) {

  // Use this to get a file path appropriate for displaying
  chrome.fileSystem.getDisplayPath(fileEntry, function(path) {
    fileDisplayPath = path;
  });

  var contents = 'yay';

  fileEntry.createWriter(function(fileWriter) {

    var truncated = false;
    var blob = new Blob([contents]);

    fileWriter.onwriteend = function(e) {
      if (!truncated) {
        truncated = true;
        // You need to explicitly set the file size to truncate
        // any content that might have been there before
        this.truncate(blob.size);
        return;
      }
    };

    fileWriter.onerror = function(e) {
    };

    fileWriter.write(blob);

  });
}