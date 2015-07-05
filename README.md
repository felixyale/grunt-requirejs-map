# grunt-requirejs-map

> Generate dependencies of js files.

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

#### options.mainConfigFile
Type: `String`
Default value: `'require-config.json'`

Config of Requirejs, must be json format.
```json
{
  "paths": {
    "foo": "assets/basic/js/foo",
    "bar": "assets/basic/js/bar",
    "wx": "http://res.wx.qq.com/open/js/jweixin-1.0.0",
    "jquery": "assets/basic/jquery",
    "core": "assets/basic/core",
    "main": "assets/js/main"
  },
  "shim": {
    "foo": {
      "deps": ["jquery"],
      "exports": "foo"
    },
    "bar": ["jquery"]
  }
}
```

#### options.dest
Type: `String`
Default value: `'./tmp/require-config.json'`

Destination file path.

### Usage Examples

#### Default Options

```js
grunt.initConfig({
  requirejs_map: {
    options: {}
  },
});
```

##### Output json file

You will get a json file like this:
```json
{
  "paths": {
    "foo": "assets/basic/js/foo",
    "bar": "assets/basic/js/bar",
    "wx": "http://res.wx.qq.com/open/js/jweixin-1.0.0",
    "jquery": "assets/basic/jquery",
    "core": "assets/basic/core",
    "main": "assets/js/main"
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
    "main": {
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
        mainConfigFile: 'require-config.json',
        dest: 'tmp/custom.json'
      }
    }
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
version 1.0.0
