/*
 * grunt-requirejs-map
 * https://github.com/felix/grunt-requirejs-map
 *
 * Copyright (c) 2015 felixyale
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    assetsDir: 'test/fixtures/',

    // Configuration to be run (and then tested).
    requirejs_map: {
      default_options: {
        options: {
          assetsDir: '<%= assetsDir %>',
          assetsMapFile: '<%= assetsDir %>assets.json',
          mainConfigFile: '<%= assetsDir %>require-config.json'
        },
        files: {
          'tmp/default_options': ['<%= assetsDir %>**/*.js']
        }
      },
      custom_options: {
        options: {
          assetsDir: '<%= assetsDir %>',
          assetsMapFile: '<%= assetsDir %>assets.json',
          mainConfigFile: '<%= assetsDir %>require-config.json',
          dest: 'tmp/custom.json'
        },
        files: {
          'tmp/custom_options': ['<%= assetsDir %>**/*.js']
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'requirejs_map', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
