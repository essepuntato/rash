var gulp = require('gulp'),
  concat = require('gulp-concat'),
  watch = require('gulp-watch');

var jsFiles = ['js/editor/*.js'],//, 'js/libs/*.js'],
  jsDest = 'js/';

gulp.task('watch', function () {
  gulp.watch(jsFiles, ['build']);
});

gulp.task('build', function () {
  return gulp.src(jsFiles)
    .pipe(concat('raje.js'))
    .pipe(gulp.dest(jsDest));
});
