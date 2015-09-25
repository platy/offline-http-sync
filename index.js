const util = require('util');
const EventEmitter = require("events").EventEmitter;
const request = require('request');
const fs = require('fs');

function HttpWatcher() {
  EventEmitter.call(this);
}
util.inherits(HttpWatcher, EventEmitter);

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
 * @param {string|object} srcOptions takes either a uri or the options that require() takes
 * @param destPath
 * @param {syncCallback} callback
 */
exports.sync = function(srcOptions, destPath, callback) {
  var watcher = new HttpWatcher();
  const tempCachePath = destPath + '.temp';
  downloadFile(srcOptions, tempCachePath, function() {
    fs.rename(tempCachePath, destPath, function(err) {
      if (err)
        watcher.emit('error', err);
      else
        watcher.emit('ready');
    });
  }, function(err) {
    httpFailed(destPath, err, watcher);
  }, function(error) {
    watcher.emit('error', error)
  });
  watcher.update = function() {
    downloadFile(srcOptions, tempCachePath, function() {
      fs.rename(tempCachePath, destPath, function(err) {
        if (err)
          watcher.emit('error', err);
        else
          watcher.emit('update');
      });
    }, function(err) {
      watcher.emit('downloadError', err)
    }, function(error) {
      watcher.emit('error', error)
    });
  };
  if(callback)
    watcher
        .on('ready', callback)
        .on('error', callback)
        .on('downloadError', function(error){callback(null, error)});
  return watcher;
};

function downloadFile(srcOptions, destPath, cbDone, cbDownloadFail, cbFileFailed) {
  var file = fs.createWriteStream(destPath);
  function downloadFailed(err) {
    file.close();
    fs.unlink(destPath);
    return cbDownloadFail(err);
  }
  file.on('open', function () {
    const req = request.get(srcOptions);
    req.on('error', downloadFailed)
        .on('response', function (response) {
          if (response.statusCode >= 400) {
            req.removeAllListeners();
            return downloadFailed(new Error('HTTP response indicated failure to get resource: ' + response.statusCode));
          }
        })
        .on('end', cbDone)
        .pipe(file);
  });
  file.on('error', cbFileFailed);
}

function httpFailed(destPath, downloadError, watcher) {
  fs.access(destPath, fs.R_OK, function(fileError) {
      if(fileError)
        watcher.emit('error', fileError, downloadError);
      else
        watcher.emit('downloadError', downloadError);
  });
}
