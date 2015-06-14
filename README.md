# grunt-requirejs-map

> Create a map of dependencies of js files.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-requirejs-map --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-requirejs-map');
```

## The "requirejs_map" task

### Overview
In your project's Gruntfile, add a section named `requirejs_map` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  requirejs_map: {
    your_target: {
      options: {
        // Task-specific options go here.
      },
      // Target-specific file lists go here.
    },
  },
});
```

### Options

#### options.assetsDir
Type: `String`
Default value: `''`

Assets direction.

#### options.assetsMapFile
Type: `String`
Default value: `'assets.json'`

Assets md5 map, must be json format.

#### options.mainConfigFile
Type: `String`
Default value: `'require-config.json'`

Config of Requirejs, must be json format.

#### options.dest
Type: `String`
Default value: `'./tmp/require-map.json'`

Destination file path.

### Usage Examples

#### Default Options

```js
grunt.initConfig({
  requirejs_map: {
    options: {},
    files: {
      'tmp/default_options': ['./**/*.js'],
    },
  },
});
```

##### Output json file

You will get a json file like this:
```json
{
  "paths": {
    "foo": "assets/basic/js/foo.cb6ebd07.js",
    "bar": "assets/basic/js/bar.e52a2c07.js",
    "assets/basic/core.css": "assets/basic/core.a0c2ce43.css",
    "assets/basic/core": "assets/basic/core.24587c5c.js",
    "assets/js/main": "assets/js/main.9cfca1e8.js"
  },
  "shim": {
    "foo": {
      "deps": [
      "jquery",
        "bar"
      ],
      "exports": "foo"
    },
    "bar": {
      "deps": [
        "jquery"
      ]
    },
    "assets/js/main": {
      "deps": [
        "foo"
      ]
    }
  }
}
```

#### Custom Options

```js
grunt.initConfig({
  assetsDir: 'test/fixtures/',
  requirejs_map: {
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
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
