# offline-http-sync

offline-http-sync will download a file over http (if possible) and cache it locally where you specify. If the resource is not
available, it will load the file from the cache. This is for when the availability of a resource is more important that
its consistency.

## Usage

Use symlink as api inspiration
```
var sl = require('offline-http-sync');
sl.sync('http://www.example.com/resource', './resourcecache', function(err) {

};
var s = fs.readStream('./resourcecache');
```

## Milestones

- (0.0) Download a file and store locally at startup
- (0.1) Periodically attempt to download updated resource in the background, replace the existing file and notify when it has been replaced
- (0.2) Diff the files and only notify when the file changes
- (0.3) Use http caching headers to reduce how resources are downloaded
- (1.0) Well tested, api reviewed, feature complete, documented, name settled - aka Done
