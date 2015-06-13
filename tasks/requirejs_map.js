/*
* grunt-requirejs-map
* https://github.com/felix/grunt-requirejs-map
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

  var dependenciesPattern 
  = new RegExp('(dependencies\\s*(:|=)\\s*\\[\\s*(' + dependencyPathPattern.source + '\\s*,?\\s*)*\\]\\s*)|(dependencies\\s*\\.\\s*push\\(\\s*(' + dependencyPathPattern.source + '\\s*,?\\s*)*)', 'ig');
  
  var isJs = new RegExp('.js$', 'i');

  grunt.registerMultiTask('requirejs_map', 'Create a map of dependency of rjs files.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      punctuation: '.',
      separator: ', ',
      dest: ''
    });

    if (!options.mainConfigFile) {
      grunt.log.error('options.mainConfigFile must be specifiled.');
      return false;
    }
    
    if (!grunt.file.exists(options.mainConfigFile)) {
      grunt.log.warn('MainConfigFile file "' + options.mainConfigFile + '" not found.');
      return false;
    } else {
      var rconfig = grunt.file.readJSON(options.mainConfigFile);
    }

    var dir = options.dest.replace(/^\.*\/*|\/$/g, '') + '/';
    
    var _assetsMap = grunt.file.readJSON(options.assetsMapFile);
    var assetsMap = {};
    
    var pathMap = rconfig.paths;
    var shimMap = rconfig.shim;
    var _pathMap = {};
    var __pathMap = {};

    (function() {
      for (var i in pathMap) {
        _pathMap[pathMap[i]] = i;
      }
    })();

    (function() {
      for (var i in _assetsMap) {
        if (isJs.test(i)) {
          var key = i.substr(0, i.length-3);
          if (key && (key in _pathMap)) {
            pathMap[_pathMap[key]] = assetsMap[_pathMap[key]] = _assetsMap[i];
            __pathMap[_assetsMap[i]] = _pathMap[key];
          } else {
            pathMap[key] = _assetsMap[i];
            __pathMap[_assetsMap[i]] = key;
          }
        } else {
          // css and image path
          pathMap[i] = _assetsMap[i];
        }
      }
    })();

    _pathMap = __pathMap;

    // add dependencies to shim
    function shim(filepath, des) {
      var _path = filepath = filepath.substr(dir.length, filepath.length-3);
      var path = _pathMap[_path];

      des.forEach(function(desPath) {
        desPath = desPath.substr(1, desPath.length-2);
        if (path != desPath) {
          if (!shimMap[path]) {
            shimMap[path] = {
              deps: [desPath]
            };
          } else {
            if (shimMap[path] instanceof Array) {
              shimMap[path] = {
                deps: shimMap[path]
              };
            } else if (!shimMap[path]['deps'] ) {
              shimMap[path]['deps'] = [];
            }

            if (shimMap[path]['deps'].indexOf(desPath) == -1) {
              shimMap[path]['deps'].push(desPath);
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
          grunt.log.warn('Source file "' + filepath + '" not found.');
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
        var dependenciesMatchs = contents.match(dependenciesPattern);

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
      
        if(dependenciesMatchs) {
          dependenciesMatchs.forEach(function(dependenciesMatch) {
            var pathMatchs = dependenciesMatch.match(dependencyPathPattern);
            if(pathMatchs) {
              dependencies = dependencies.concat(pathMatchs);
            }
          });
        }

        shim(filepath, dependencies);

        return contents;
      }).join(grunt.util.normalizelf(options.separator));

    });

    // Write the destination file.
    grunt.file.write(options.dest + '/require-map.json', JSON.stringify(rconfig));

    // Print a success message.
    grunt.log.writeln('File "' + options.dest + '/require-map.json' + '" created.');
  });

};
