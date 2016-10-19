
var Module;

if (typeof Module === 'undefined') Module = {};

if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {
 var loadPackage = function(metadata) {

    var PACKAGE_PATH;
    if (typeof window === 'object') {
      PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    } else if (typeof location !== 'undefined') {
      // worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
    } else {
      throw 'using preloaded data can only be done on a web page or in a web worker';
    }
    var PACKAGE_NAME = 'visageAnalysisData.data';
    var REMOTE_PACKAGE_BASE = 'visageAnalysisData.data';
    if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
      Module['locateFile'] = Module['locateFilePackage'];
      Module.printErr('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
    }
    var REMOTE_PACKAGE_NAME = typeof Module['locateFile'] === 'function' ?
                              Module['locateFile'](REMOTE_PACKAGE_BASE) :
                              ((Module['filePackagePrefixURL'] || '') + REMOTE_PACKAGE_BASE);
  
    var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
    var PACKAGE_UUID = metadata.package_uuid;
  
    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        var size = packageSize;
        if (event.total) size = event.total;
        if (event.loaded) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: size
            };
          } else {
            Module.dataFileDownloads[url].loaded = event.loaded;
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
          var data = Module.dataFileDownloads[download];
            total += data.total;
            loaded += data.loaded;
            num++;
          }
          total = Math.ceil(total * Module.expectedDataFileDownloads/num);
          if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
        } else if (!Module.dataFileDownloads) {
          if (Module['setStatus']) Module['setStatus']('Downloading data...');
        }
      };
      xhr.onload = function(event) {
        var packageData = xhr.response;
        callback(packageData);
      };
      xhr.send(null);
    };

    function handleError(error) {
      console.error('package error:', error);
    };
  
      var fetched = null, fetchedCallback = null;
      fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);
    
  function runWithFS() {

    function assert(check, msg) {
      if (!check) throw msg + new Error().stack;
    }
Module['FS_createPath']('/', 'bdtsdata', true, true);
Module['FS_createPath']('/bdtsdata', 'LBF', true, true);
Module['FS_createPath']('/bdtsdata/LBF', 'vfadata', true, true);
Module['FS_createPath']('/bdtsdata/LBF/vfadata', 'ad', true, true);
Module['FS_createPath']('/bdtsdata/LBF/vfadata', 'ed', true, true);
Module['FS_createPath']('/bdtsdata/LBF/vfadata', 'ed - Copy', true, true);
Module['FS_createPath']('/bdtsdata/LBF/vfadata', 'gd', true, true);

    function DataRequest(start, end, crunched, audio) {
      this.start = start;
      this.end = end;
      this.crunched = crunched;
      this.audio = audio;
    }
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.name = name;
        this.requests[name] = this;
        Module['addRunDependency']('fp ' + this.name);
      },
      send: function() {},
      onload: function() {
        var byteArray = this.byteArray.subarray(this.start, this.end);

          this.finish(byteArray);

      },
      finish: function(byteArray) {
        var that = this;

        Module['FS_createDataFile'](this.name, null, byteArray, true, true, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
        Module['removeRunDependency']('fp ' + that.name);

        this.requests[this.name] = null;
      },
    };

        var files = metadata.files;
        for (i = 0; i < files.length; ++i) {
          new DataRequest(files[i].start, files[i].end, files[i].crunched, files[i].audio).open('GET', files[i].filename);
        }

  
    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      assert(arrayBuffer instanceof ArrayBuffer, 'bad input to processPackageData');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
      
        // copy the entire loaded file into a spot in the heap. Files will refer to slices in that. They cannot be freed though
        // (we may be allocating before malloc is ready, during startup).
        if (Module['SPLIT_MEMORY']) Module.printErr('warning: you should run the file packager with --no-heap-copy when SPLIT_MEMORY is used, otherwise copying into the heap may fail due to the splitting');
        var ptr = Module['getMemory'](byteArray.length);
        Module['HEAPU8'].set(byteArray, ptr);
        DataRequest.prototype.byteArray = Module['HEAPU8'].subarray(ptr, ptr+byteArray.length);
  
          var files = metadata.files;
          for (i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }
              Module['removeRunDependency']('datafile_visageAnalysisData.data');

    };
    Module['addRunDependency']('datafile_visageAnalysisData.data');
  
    if (!Module.preloadResults) Module.preloadResults = {};
  
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }
    
  }
  if (Module['calledRun']) {
    runWithFS();
  } else {
    if (!Module['preRun']) Module['preRun'] = [];
    Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
  }

 }
 loadPackage({"files": [{"audio": 0, "start": 0, "crunched": 0, "end": 687497, "filename": "/bdtsdata/LBF/vfadata/ad/ad.lbf"}, {"audio": 0, "start": 687497, "crunched": 0, "end": 796858, "filename": "/bdtsdata/LBF/vfadata/ed/ed0.lbf"}, {"audio": 0, "start": 796858, "crunched": 0, "end": 906219, "filename": "/bdtsdata/LBF/vfadata/ed/ed1.lbf"}, {"audio": 0, "start": 906219, "crunched": 0, "end": 1015580, "filename": "/bdtsdata/LBF/vfadata/ed/ed2.lbf"}, {"audio": 0, "start": 1015580, "crunched": 0, "end": 1124941, "filename": "/bdtsdata/LBF/vfadata/ed/ed3.lbf"}, {"audio": 0, "start": 1124941, "crunched": 0, "end": 1234302, "filename": "/bdtsdata/LBF/vfadata/ed/ed4.lbf"}, {"audio": 0, "start": 1234302, "crunched": 0, "end": 1343663, "filename": "/bdtsdata/LBF/vfadata/ed/ed5.lbf"}, {"audio": 0, "start": 1343663, "crunched": 0, "end": 1453024, "filename": "/bdtsdata/LBF/vfadata/ed/ed6.lbf"}, {"audio": 0, "start": 1453024, "crunched": 0, "end": 1562385, "filename": "/bdtsdata/LBF/vfadata/ed - Copy/ed0.lbf"}, {"audio": 0, "start": 1562385, "crunched": 0, "end": 1671746, "filename": "/bdtsdata/LBF/vfadata/ed - Copy/ed1.lbf"}, {"audio": 0, "start": 1671746, "crunched": 0, "end": 1781107, "filename": "/bdtsdata/LBF/vfadata/ed - Copy/ed2.lbf"}, {"audio": 0, "start": 1781107, "crunched": 0, "end": 1890468, "filename": "/bdtsdata/LBF/vfadata/ed - Copy/ed3.lbf"}, {"audio": 0, "start": 1890468, "crunched": 0, "end": 1999829, "filename": "/bdtsdata/LBF/vfadata/ed - Copy/ed4.lbf"}, {"audio": 0, "start": 1999829, "crunched": 0, "end": 2109190, "filename": "/bdtsdata/LBF/vfadata/ed - Copy/ed5.lbf"}, {"audio": 0, "start": 2109190, "crunched": 0, "end": 2218551, "filename": "/bdtsdata/LBF/vfadata/ed - Copy/ed6.lbf"}, {"audio": 0, "start": 2218551, "crunched": 0, "end": 2571968, "filename": "/bdtsdata/LBF/vfadata/gd/gd.lbf"}], "remote_package_size": 2571968, "package_uuid": "11a0668f-a694-484a-bf29-7de500beb161"});

})();
