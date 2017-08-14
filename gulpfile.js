/* eslint no-console: "off" */
'use strict';
var gulp = require('gulp');
var rimraf = require('rimraf');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var vbuffer = require('vinyl-buffer');
var nodemon = require('nodemon');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

var reactApps = ['reactApp', 'listEditApp', 'listTrainingApp', 'discussionApp'];

gulp.task('default', ['server-prod']);

gulp.task('build', ['sass'].concat(reactApps.map((app) => {return app + '-prod';})), function() {
  process.exit(0);
});

gulp.task('clean', function(done) {
  rimraf('public/{style/scribbing.css,js/*}', function(err) {
    done(err);
  });
});

var buildSASS = function () {
  return gulp.src('./src/styles/scribbing.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('./public/style/'));      
};

gulp.task('sass', ['clean'], buildSASS);
gulp.task('sass-watch', buildSASS);

//      .pipe(uglify())


function reactBuild(fileName) {
  var build = function (done) {
    var b = browserify({entries: 'src/react/' + fileName + '.jsx', debug: true, transform: ['babelify']});

    b
      .bundle()
      .pipe(source(fileName + '.js'))
      .pipe(vbuffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(uglify())
      .on('error', function(err){
        console.log(err.stack);
        done();
      })
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./public/js'))
      .on('end', function() {
        done(null);
      });

    watchify(b);
      
  };

  var buildDev = function (done) {
    var b = browserify({entries: 'src/react/' + fileName + '.jsx', debug: true, transform: ['babelify']});

    b
      .bundle()
      .pipe(source(fileName + '.js'))
      .pipe(vbuffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .on('error', function(err){
        console.log(err.stack);
        done();
      })
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./public/js'))
      .on('end', function() {
        done(null);
      });

    watchify(b);
      
  };

  gulp.task(fileName, ['clean'], buildDev);
  gulp.task(fileName + '-watch', buildDev);
  gulp.task(fileName + '-prod', build);
}

reactApps.forEach(function(fileName) {
  reactBuild(fileName);
});

gulp.task('server-prod', ['watch'], function() {
  // configure nodemon
  nodemon({
    // the script to run the app
    script: 'app.js',
    // this listens to changes in any of these files/routes and restarts the application
    watch: ['app.js', 'routes/', 'lib/**', '.env'],
    ext: 'js'
  }).on('restart', () => {
    console.log('Change detected... restarting server...');
    gulp.src('server.js');
  });
});

gulp.task('watch', ['sass'].concat(reactApps), function () {
  gulp.watch('./src/styles/**/*.scss', ['sass-watch']);
  reactApps.forEach(function(fileName) {
    gulp.watch('./src/react/' + fileName + '.jsx', [fileName + '-watch']);
  });
});


