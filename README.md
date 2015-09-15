# offline-http-sync

[![Build Status](https://travis-ci.org/platy/offline-http-sync.svg?branch=master)](https://travis-ci.org/platy/offline-http-sync)

offline-http-sync will download a file over http (if possible) and cache it locally where you specify. If the resource is not
available, it will load the file from the cache. This is for when the availability of a resource is more important that
its consistency.

## Usage

Load some resource over http, saving to cache, or just from cache if http resource is not available.
```
var sl = require('offline-http-sync');
var resourceLoader = sl.sync('http://www.example.com/resource', './resourcecache');
resourceLoader.on('error', function(fileError, httpError) {
  console.err(httpError, 'Resource needed for startup could not be retrieved);
});
resourceLoader.on('ready', function() {
  var s = fs.readStream('./resourcecache');
});
```

Update the cache at some point.
```
resourceLoader.update();
resourceLoader.on('update', function() {
  console.log('Resource updated');
});
```

## Milestones

- (0.0) Download a file and store locally at startup, ability to request an update to the file (in the same process), replace the existing file and notify when it has been replaced
- (0.1) Periodically attempt to download updated resource in the background with a good api
- (0.2) Diff the files and only notify when the file changes
- (0.3) Use http caching headers to reduce how resources are downloaded
- (1.0) Well tested, api reviewed, feature complete, documented, name settled - aka Done
