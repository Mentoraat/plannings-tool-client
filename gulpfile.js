/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var load = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var merge = require('merge-stream');
var path = require('path');
var fs = require('fs');
var glob = require('glob-all');
var packageJson = require('./package.json');
var crypto = require('crypto');
var ensureFiles = require('./tasks/ensure-files.js');
var url = require('url');
var proxy = require('proxy-middleware');
var latex = require('gulp-latex');
var stylemod = require('gulp-style-modules');
var historyApiFallback = require('connect-history-api-fallback')

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

var DIST = 'dist';

var dist = function(subpath) {
  return !subpath ? DIST : path.join(DIST, subpath);
};

var styleTask = function (stylesPath, srcs) {
  return gulp.src(srcs.map(function(src) {
      return path.join('app', stylesPath, src);
    }))
    .pipe(load.changed(stylesPath, {extension: '.css'}))
    .pipe(load.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/' + stylesPath))
    .pipe(load.minifyCss())
    .pipe(gulp.dest(dist(stylesPath)))
    .pipe(load.size({title: stylesPath}));
};

var imageOptimizeTask = function(src, dest) {
  return gulp.src(src)
    .pipe(load.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(dest))
    .pipe(load.size({title: 'images'}));
};

var optimizeHtmlTask = function(src, dest) {
  var assets = load.useref.assets({
    searchPath: ['.tmp', 'app']
  });

  return gulp.src(src)
    .pipe(assets)
    // Concatenate and minify JavaScript
    .pipe(load.if('*.js', load.uglify({
      preserveComments: 'some'
    })))
    // Concatenate and minify styles
    // In case you are still using useref build blocks
    .pipe(load.if('*.css', load.minifyCss()))
    .pipe(assets.restore())
    .pipe(load.useref())
    // Minify any HTML
    .pipe(load.if('*.html', load.minifyHtml({
      quotes: true,
      empty: true,
      spare: true
    })))
    // Output files
    .pipe(gulp.dest(dest))
    .pipe(load.size({
      title: 'html'
    }));
};

var compileLatex = function() {
  return gulp.src(['app/files/**/index.tex'])
    .pipe(latex())
    .pipe(gulp.dest(dist('files')));
};

// Compile and automatically prefix stylesheets
gulp.task('styles', ['modularize-styles'], function() {
  return styleTask('styles', ['**/*.css']);
});

gulp.task('elements', function() {
  return styleTask('elements', ['**/*.css']);
});

// Ensure that we are not missing required files for the project
// "dot" files are specifically tricky due to them being hidden on
// some systems.
gulp.task('ensureFiles', function(cb) {
  var requiredFiles = ['.jscsrc', '.jshintrc', '.bowerrc'];

  ensureFiles(requiredFiles.map(function(p) {
    return path.join(__dirname, p);
  }), cb);
});

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src([
      'app/scripts/**/*.js',
      'app/elements/**/*.js',
      'app/elements/**/*.html'
    ])
    .pipe(reload({stream: true, once: true}))
    .pipe(load.jshint.extract()) // Extract JS from .html files
    .pipe(load.jshint())
    .pipe(load.jshint.reporter('jshint-stylish'))
    .pipe(load.if(!browserSync.active, load.jshint.reporter('fail')));
});

// Optimize images
gulp.task('images', function() {
  return imageOptimizeTask('app/images/**/*', dist('images'));
});

// Copy All Files At The Root Level (app)
gulp.task('copy', function() {
  var app = gulp.src([
    'app/*',
    '!app/elements.html',
    '!app/test',
    '!app/elements',
    '!app/bower_components',
    '!app/cache-config.json',
    '!**/.DS_Store'
  ], {
    dot: true
  }).pipe(gulp.dest(dist()));

  // Copy over only the bower_components we need
  // These are things which cannot be vulcanized
  var bower = gulp.src([
    'app/bower_components/**/*'
  ]).pipe(gulp.dest(dist('bower_components')));

  var pdfs = compileLatex();

  var files = gulp.src(['app/files/*'])
    .pipe(gulp.dest(dist('files')));

  return merge(app, bower, pdfs, files)
    .pipe(load.size({title: 'copy'}));
});

// Copy Web Fonts To Dist
gulp.task('fonts', function () {
  return gulp.src(['app/fonts/**'])
    .pipe(gulp.dest('dist/fonts'))
    .pipe(load.size({title: 'fonts'}));
});

var styles = [
  'app/bower_components/fullcalendar/dist/fullcalendar.min.css',
  'app/styles/fullcalendar-material.css'
];

gulp.task('modularize-styles', function() {
  var getFileName = function(file) {
    var fixedPath = file.path.replace('.min', '');
    var extension = path.extname(file.path);
    return path.basename(fixedPath, extension) + "-styles";
  };

  return gulp.src(styles)
    .pipe(stylemod({
      filename: getFileName,
      moduleId: getFileName
    }))
    .pipe(gulp.dest('app/styles'));
});

// Scan your HTML for assets & optimize them
gulp.task('html', function() {
  return optimizeHtmlTask(
    ['app/**/*.html', '!app/{elements,test,bower_components}/**/*.html'],
    dist());
});

// Vulcanize granular configuration
gulp.task('vulcanize', function() {
  return gulp.src('app/elements.html')
    .pipe(load.vulcanize({
      stripComments: true,
      inlineCss: true,
      inlineScripts: true
    }))
    .pipe(gulp.dest(dist()))
    .pipe(load.size({title: 'vulcanize'}));
});


// Generate config data for the <sw-precache-cache> element.
// This include a list of files that should be precached, as well as a (hopefully unique) cache
// id that ensure that multiple PSK projects don't share the same Cache Storage.
// This task does not run by default, but if you are interested in using service worker caching
// in your project, please enable it within the 'default' task.
// See https://github.com/PolymerElements/polymer-starter-kit#enable-service-worker-support
// for more context.
gulp.task('cache-config', function(callback) {
  var dir = dist();
  var config = {
    cacheId: packageJson.name || path.basename(__dirname),
    disabled: false
  };

  glob([
    'index.html',
    './',
    'bower_components/webcomponentsjs/webcomponents-lite.min.js',
    '{elements,scripts,styles}/**/*.*'],
    {cwd: dir}, function(error, files) {
    if (error) {
      callback(error);
    } else {
      config.precache = files;

      var md5 = crypto.createHash('md5');
      md5.update(JSON.stringify(config.precache));
      config.precacheFingerprint = md5.digest('hex');

      var configPath = path.join(dir, 'cache-config.json');
      fs.writeFile(configPath, JSON.stringify(config), callback);
    }
  });
});

// Clean output directory
gulp.task('clean', function() {
  return del(['.tmp', dist()]);
});

// Watch Files For Changes & Reload
gulp.task('serve', ['styles', 'elements', 'images'], function () {
  var proxyOptions = url.parse("http://localhost:9000/v1/");
  proxyOptions.route = "/v1";

  browserSync({
    notify: false,
    logPrefix: 'PSK',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function (snippet) {
          return snippet;
        }
      }
    },
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: {
      baseDir: ['.tmp', 'app'],
      middleware: [proxy(proxyOptions), historyApiFallback()]
    }
  });

  gulp.watch(['app/**/*.html'], reload);
  gulp.watch(['app/styles/**/*.css'], ['styles', reload]);
  gulp.watch(['app/elements/**/*.css'], ['elements', reload]);
  gulp.watch(['app/{scripts,elements}/**/*.js'], ['jshint']);
  gulp.watch(['app/images/**/*'], reload);
});

gulp.task('latex', function() {
  return compileLatex();
});

// Build production files, the default task
gulp.task('default', ['clean'], function(cb) {
  runSequence(
    ['copy', 'styles'],
    'elements',
    ['jshint', 'images', 'fonts', 'html'],
    'vulcanize', 'cache-config',
    cb);
});

// Load tasks for web-component-tester
// Adds tasks for `gulp test:local` and `gulp test:remote`
// require('web-component-tester').gulp.init(gulp);

// Load custom tasks from the `tasks` directory
try {
  require('require-dir')('tasks');
} catch (err) {}
