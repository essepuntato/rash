var gulp = require('gulp'),
  concat = require('gulp-concat'),
  watch = require('gulp-watch'),
  sourcemaps = require('gulp-sourcemaps')

var jsFiles = ['js/rajemce/init.js', 'js/rajemce/plugin/*.js'],
  jsDest = './js/rajemce';

gulp.task('watch', function () {
  gulp.watch(jsFiles, ['build']);
});

gulp.task('build', function () {
  return gulp.src(jsFiles)
    .pipe(sourcemaps.init())
    .pipe(concat('raje_core.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(jsDest));
});