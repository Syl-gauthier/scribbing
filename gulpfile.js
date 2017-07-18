/* eslint no-console: "off" */
'use strict';
var gulp = require('gulp');
var sass = require('gulp-sass');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var rimraf = require('rimraf');
var nodemon = require('nodemon');


gulp.task('default', ['server']);
gulp.task('build', ['sass', 'jsx']);

gulp.task('clean', function(done) {
  rimraf('public/@(style|js)/**', function(err) {
    done(err);
  });
});

var buildSASS = function () {
  return gulp.src('./src/styles/scribbing.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/style/'));      
};

gulp.task('sass', ['clean'], buildSASS);
gulp.task('sass-watch', buildSASS);

var buildJSX = function(done) {
  watchify(browserify({entries: 'src/react/reactApp.jsx', debug: true}))
    .transform('babelify', {presets: ['es2015', 'react']})
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./public/js'))
    .on('end', function() {done(null);})
    .on('error', console.error.bind(console));
};

gulp.task('jsx', ['clean'], buildJSX);
gulp.task('jsx-watch', buildJSX);


gulp.task('server', ['watch'], function() {
  gulp.task('server', function() {
    // configure nodemon
    nodemon({
      // the script to run the app
      script: 'app.js',
      // this listens to changes in any of these files/routes and restarts the application
      watch: ['app.js', 'routes/', 'lib/**'],
      ext: 'js'
      // Below i'm using es6 arrow functions but you can remove the arrow and have it a normal .on('restart', function() { // then place your stuff in here }
    }).on('restart', () => {
      console.log('Change detected... restarting server...');
      gulp.src('server.js');
    });
  });
});

gulp.task('watch', ['sass', 'jsx'], function () {
  gulp.watch('./src/styles/*.scss', ['sass-watch']);
  gulp.watch('./src/react/**', ['jsx-watch']);
});


