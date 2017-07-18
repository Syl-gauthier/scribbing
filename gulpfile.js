/* eslint no-console: "off" */
'use strict';
var gulp = require('gulp');
var sass = require('gulp-sass');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var rimraf = require('rimraf');
var nodemon = require('nodemon');

var reactApps = ['reactApp', 'listEditApp'];

gulp.task('default', ['server']);
gulp.task('build', ['sass'].concat(reactApps));

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

function reactBuild(fileName) {
  var build = function (done) {
    watchify(browserify({entries: 'src/react/' + fileName + '.jsx', debug: true}))
      .transform('babelify', {presets: ['es2015', 'react']})
      .bundle()
      .on('error', function(err){
        console.log(err.stack);
        done();
      })
      .pipe(source(fileName + '.js'))
      .pipe(gulp.dest('./public/js'))
      .on('end', function() {done(null);});
  };

  gulp.task(fileName, ['clean'], build);
  gulp.task(fileName + '-watch', build);
}

reactApps.forEach(function(fileName) {
  reactBuild(fileName);
});

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

gulp.task('watch', ['sass'].concat(reactApps), function () {
  gulp.watch('./src/styles/*.scss', ['sass-watch']);
  reactApps.forEach(function(fileName) {
    gulp.watch('./src/react/' + fileName + '.jsx', [fileName + '-watch']);
  });
});


