# offline-http-sync

offline-http-sync will download a file over http (if possible) and cache it locally where you specify. If the resource is not
available, it will load the file from the cache. This is for when the availability of a resource is more important that
its consistency.

## Usage

Use symlink as api inspiration
```
var sl = require('offline-http-sync');
sl.synclink('http://www.example.com/resource', './resourcecache', function(err) {

};
var s = fs.readStream('./resourcecache');
```

## Coming soon
It should also be able to check periodically for updates and notify your app. This will be in a separate process. Use
watchify as api inspiration.

- periodically update cache file from http in the background
- notify when the file has been replaced
- not change the file, only change the link so that the file can always be read safely
- only change the link and notify if the file has changed
- take advantage of caching properties of http


## Milestones

- 0.0 Download a file  and store locally at startup
