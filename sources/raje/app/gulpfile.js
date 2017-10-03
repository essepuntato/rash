var gulp = require('gulp'),
  concat = require('gulp-concat'),
  watch = require('gulp-watch');

var jsFiles = ['js/rajemce/init.js', 'js/rajemce/plugin/*.js'],
  jsDest = './js/rajemce';

gulp.task('watch', function () {
  gulp.watch(jsFiles, ['build']);
});

gulp.task('build', function () {
  return gulp.src(jsFiles)
    .pipe(concat('rajemce.js'))
    .pipe(gulp.dest(jsDest));
});