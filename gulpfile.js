/* eslint no-console: "off" */
'use strict';
var gulp = require('gulp');
var sass = require('gulp-sass');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var rimraf = require('rimraf');
var nodemon = require('nodemon');


gulp.task('default', ['server']);
gulp.task('build', ['sass', 'jsx']);

gulp.task('clean:sass', function(done) {
  rimraf('public/style/**', function(err) {
    done(err);
  });
});

gulp.task('clean:jsx', function(done) {
  rimraf('public/js/**', function(err) {
    done(err);
  });
});

gulp.task('sass', ['clean:sass'], function () {
  return gulp.src('./src/styles/scribbing.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/style/'));      
});

gulp.task('jsx', ['clean:jsx'], function(done) {
  browserify('src/react/reactApp.jsx')
    .transform('babelify', {presets: ['es2015', 'react']})
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./public/js'))
    .on('end', function() {done(null);});
});

gulp.task('server', ['sass', 'jsx'], function() {
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

gulp.task('watch', ['jsx', 'sass'], function () {
  gulp.watch('./src/styles/*.scss', ['sass']);
  gulp.watch('./src/react/**', ['jsx']);
});


