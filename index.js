
var http = require('http');
var fs = require('fs');


/**
 * This callback type is called once an asynchronous sync completes. The first error is fatal, the other can be
 * ignored but you may want to trigger a warning.
 *
 * @callback syncCallback
 * @param {Error} cacheError probably a fatal error, this either means that either we couldn't write the downloaded file to the cache or that the download failed and we couldn't read from the cache. This could be some filesystem error or the download error
 * @param {Error} refreshError the resource failed to download, the file should be available at the cache unless there was also a cache Error. This may be the same as the cacheError.
 */

/**
 *
 * @param srcUrl
 * @param destPath
 * @param {syncCallback} callback
 */
exports.sync = function(srcUrl, destPath, callback) {
  http.get(srcUrl, function(response) {
    if(response.statusCode >= 400)
      return httpFailed(destPath, new Error('HTTP response indicated failure to get resource: ' + response.statusCode), callback);
    var file = fs.createWriteStream(destPath);
    file.on('open', function() {
      response.pipe(file);
      response.on('end', callback);
    });
    file.on('error', callback);
  }).on('error', function(err) {
    httpFailed(destPath, err, callback);
  });
};

function httpFailed(destPath, downloadError, callback) {
  fs.access(destPath, fs.R_OK, function(fileError) {
    console.log('Access', destPath, fileError);
      callback(fileError, downloadError);
  });
}
