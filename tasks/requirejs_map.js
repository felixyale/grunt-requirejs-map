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
  var dependencyPathPattern = new RegExp('(\'|")[\\w\\d-_/.!\\,\\:\\[\\]]+(\'|")', 'g');

  // e.g. define("moduleName",["app","controllers/main"]... define(["app","controllers/main"]...
  var definePattern = new RegExp('define\\s*\\(\\s*(' + dependencyPathPattern.source + '\\s*,?\\s*)*\\s*\\[\\s*(' + dependencyPathPattern.source + '\\s*,?\\s*)*\\s*\\]', 'ig');

  // e.g. require(['app']... require('app'...
  var requirePattern = new RegExp('(require\\s*\\(\\s*\\[\\s*(' + dependencyPathPattern.source + '\\s*,?\\s*)*\\]\\s*)|(require\\s*\\(\\s*(' + dependencyPathPattern.source + '\\s*,?\\s*)*)', 'ig');

  var jsPattern = new RegExp('\\.js$', 'i');

  var suffixPattern = new RegExp('\\.[0-9a-z]+$', 'i');

  grunt.registerMultiTask('requirejs_map', 'Create a map of dependencies of js files.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      assetsDir: '',
      mainConfigFile: 'require-config.json',
      dest: './tmp/require-config.json'
    });

    var requireConfig = {};

    if (!options.mainConfigFile || !grunt.file.exists(options.mainConfigFile)) {
      grunt.log.error('options.mainConfigFile not be specifiled or mainConfigFile file not found.');
      return false;
    } else {
      requireConfig = grunt.file.readJSON(options.mainConfigFile);
    }

    // e.g. {"foo": "assets/basic/js/foo"}
    var requirePaths = requireConfig.paths;

    // e.g. {"foo": {"deps": ["jquery"], "exports": "foo"}}
    var requireShimMap = requireConfig.shim;

    // assets dir , e.g. test/fixtures/
    var dir = options.assetsDir.replace(/^\.*\/*|\/$/g, '');

    // [...] to {deps: [...]}
    // {} to {deps: []}
    (function() {
      for (var n in requireShimMap) {
        if (requireShimMap[n] instanceof Array) {
          requireShimMap[n] = {
            deps: requireShimMap[n]
          };
        } else if (!requireShimMap[n].deps) {
          requireShimMap[n].deps = [];
        }
      }
    })();

    // add dependencies to shim
    function shim(name, des) {
      des.forEach(function(desName) {
        desName = desName.substr(1, desName.length - 2);
        if (desName && name !== desName) {
          if (!requireShimMap[name]) {
            requireShimMap[name] = {
              deps: [desName]
            };
          } else {
            if (requireShimMap[name].deps.indexOf(desName) === -1) {
              requireShimMap[name].deps.push(desName);
            }
          }
        }
      });
    }

    // get dependencies of a specified file
    function getDependencies(filepath) {
      if (!grunt.file.exists(filepath)) {
        return [];
      }

      // Read file source.
      var contents = grunt.file.read(filepath);

      // dependency path array
      var dependencies = [];

      var defineMatchs = contents.match(definePattern);
      var requireMatchs = contents.match(requirePattern);

      if (defineMatchs) {
        defineMatchs.forEach(function(defineMatch) {
          var pathMatchs = defineMatch.match(dependencyPathPattern);
          if (pathMatchs) {
            dependencies = dependencies.concat(defineMatch.match(dependencyPathPattern));
          }
        });
      }

      if (requireMatchs) {
        requireMatchs.forEach(function(requireMatch) {
          var pathMatchs = requireMatch.match(dependencyPathPattern);
          if (pathMatchs) {
            dependencies = dependencies.concat(pathMatchs);
          }
        });
      }

      return dependencies;
    }

    (function() {
      var filepath, dependencies;
      for (var name in requirePaths) {
        filepath = dir + requirePaths[name] + '.js';
        dependencies = getDependencies(filepath);

        if (dependencies.length) {
          shim(name, dependencies);
        }
      }
    })();

    // grunt.log.error('error');
    // Write the destination file.
    grunt.file.write(options.dest, JSON.stringify(requireConfig, null, 2));

    // Print a success message.
    grunt.log.writeln('File "' + options.dest + '" created.');

  });

};
