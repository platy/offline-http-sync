# httplink

httplink will download a file over http (if possible) and cache it locally where you specify. If the resource is not
available, it will load the file from the cache. This is for when the availability of a resource is more important that
its consistency.

## Usage

Use symlink as api inspiration
```
var sl = require('synclink');
sl.httplinkSync('http://www.example.com/resource', './resourcecache');
var s = fs.readStream('./resourcecache');

```

## Plans
It should also be able to check periodically for updates and notify your app. This will be in a separate process. Use
watchify as api inspiration.
