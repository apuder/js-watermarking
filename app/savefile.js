
var contents = '';

function doExportToDisk(txt) {

  contents = txt;

  chrome.fileSystem.chooseEntry( {
    type: 'saveFile',
    suggestedName: 'test.js'//,
    // accepts: [ { description: 'Text files (*.txt)',
    //              extensions: ['txt']} ],
    // acceptsAllTypes: true
  }, exportToFileEntry);
}

function exportToFileEntry(fileEntry) {

  // Use this to get a file path appropriate for displaying
  // chrome.fileSystem.getDisplayPath(fileEntry, function(path) {
  //   // fileDisplayPath = path;
  // });

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


doExportToDisk();
