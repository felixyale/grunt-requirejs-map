/*
* grunt-requirejs-map
* https://github.com/felixyale/grunt-requirejs-map
*
* Copyright (c) 2015 felixyale
* Licensed under the MIT license.
*/

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks
  // e.g. 'app', "controllers/main", "css!/styles/main"
  var dependencyPathPattern 
  = new RegExp('(\'|")[\\w\\d-_/.!\\,\\:\\[\\]]+(\'|")','g');

  // e.g. define("moduleName",["app","controllers/main"]... define(["app","controllers/main"]...
  var definePattern 
  = new RegExp('define\\s*\\(\\s*(' + dependencyPathPattern.source + '\\s*,?\\s*)*\\s*\\[\\s*(' + dependencyPathPattern.source + '\\s*,?\\s*)*\\s*\\]', 'ig');

  // e.g. require(['app']... require('app'...
  var requirePattern 
  = new RegExp('(require\\s*\\(\\s*\\[\\s*(' + dependencyPathPattern.source + '\\s*,?\\s*)*\\]\\s*)|(require\\s*\\(\\s*(' + dependencyPathPattern.source + '\\s*,?\\s*)*)', 'ig');

  var jsPattern = new RegExp('\\.js$', 'i');

  var suffixPattern = new RegExp('\\.[0-9a-z]+$', 'i');

  grunt.registerMultiTask('requirejs_map', 'Create a map of dependencies of js files.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      assetsDir: '',
      assetsMapFile: 'assets.json',
      mainConfigFile: 'require-config.json',
      dest: './tmp/require-map.json'
    });

    var requireConfig = {};

    if (!options.mainConfigFile || !grunt.file.exists(options.mainConfigFile)) {
      grunt.log.error('options.mainConfigFile not be specifiled or mainConfigFile file not found.');
      return false;
    } else {
      requireConfig = grunt.file.readJSON(options.mainConfigFile);
    }

    // e.g. {"foo": "assets/basic/js/foo"}
    var requirePathMap = requireConfig.paths;

    // e.g. {"foo": {"deps": ["jquery"], "exports": "foo"}}
    var requireShimMap = requireConfig.shim;

    // e.g. {"assets/basic/js/foo": "foo"}
    var requireAntiPathMap = {};

    // assets dir , e.g. test/fixtures/
    var dir = options.assetsDir.replace(/^\.*\/*|\/$/g, '') + '/';

    // e.g. {"assets/basic/js/bar.js": "assets/basic/js/bar.e52a2c07.js"}
    var assetsMap = grunt.file.readJSON(options.assetsMapFile);

    (function() {
      for (var i in requirePathMap) {
        requireAntiPathMap[requirePathMap[i]] = i;
      }

      // e.g. {"assets/basic/js/foo.cb6ebd07.js": "foo"}
      var _requireAntiPathMap = {};

      for (var j in assetsMap) {
        if (jsPattern.test(assetsMap[j])) {
          var key = j.replace(suffixPattern, '');
          if (key && (key in requireAntiPathMap)) {
            requirePathMap[requireAntiPathMap[key]] = assetsMap[j];
            _requireAntiPathMap[assetsMap[j]] = requireAntiPathMap[key];
          } else {
            requirePathMap[key] = assetsMap[j];
            _requireAntiPathMap[assetsMap[j]] = key;
          }
        } else {

          // css and image path
          requirePathMap[j] = assetsMap[j];
        }
      }

      requireAntiPathMap = _requireAntiPathMap;
      
      for (var n in requireShimMap) {
        if (requireShimMap[n] instanceof Array) {
          requireShimMap[n] = {
            deps: requireShimMap[n]
          };
        } else if (!requireShimMap[n]['deps']) {
          requireShimMap[n]['deps'] = [];
        }
      }
    })();

    // add dependencies to shim
    function shim(filepath, des) {
      filepath = filepath.substr(dir.length);

      if (!(filepath in requireAntiPathMap)) {
        return false;
      }

      // e.g. assets/basic/js/foo.cb6ebd07
      var filepathNoSuffix = filepath.substr(0, filepath.length-3);
      var path = requireAntiPathMap[filepath];

      des.forEach(function(desPath) {
        desPath = desPath.substr(1, desPath.length-2);
        if (path !== desPath) {
          if (!requireShimMap[path]) {
            requireShimMap[path] = {
              deps: [desPath]
            };
          } else {
            if (requireShimMap[path]['deps'].indexOf(desPath) === -1) {
              requireShimMap[path]['deps'].push(desPath);
            }
          }

        }
      });
    }

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {

      // Concat specified files.
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.error('Source file "' + filepath + '" not found.');
          return false;
        } else {
          // grunt.log.writeln(filepath);
          return true;
        }
      }).map(function(filepath) {

        // Read file source.
        var contents = grunt.file.read(filepath);

        // dependency path array
        var dependencies = [];

        var defineMatchs = contents.match(definePattern);
        var requireMatchs = contents.match(requirePattern);

        if(defineMatchs) {
          defineMatchs.forEach(function(defineMatch) {
            var pathMatchs = defineMatch.match(dependencyPathPattern);
            if(pathMatchs) {
              dependencies = dependencies.concat(defineMatch.match(dependencyPathPattern));
            }
          });

        }

        if(requireMatchs) {
          requireMatchs.forEach(function(requireMatch) {
            var pathMatchs = requireMatch.match(dependencyPathPattern);
            if(pathMatchs) {
              dependencies = dependencies.concat(pathMatchs);
            }
          });
        }

        shim(filepath, dependencies);

      });

      // grunt.log.error('error');
      // Write the destination file.
      grunt.file.write(options.dest, JSON.stringify(requireConfig, null, 2));

      // Print a success message.
      grunt.log.writeln('File "' + options.dest + '" created.');

    });

  });

};
