'use strict';

var del = require('del'),
    gulp = require('gulp'),
    serve = require('gulp-serve'),
    staticSiteGenerator = require('..');

gulp.task('html', ['clean'], function() {
  return gulp.src('./src/site/**/*')
    .pipe(staticSiteGenerator({
      jadeOptions: {
        pretty: true
      }
    }))
    .pipe(gulp.dest('./dest'));
});

gulp.task('clean', function(done) {
  del('./dest').then(function() {
    done();
  });
});

gulp.task('watch', ['serve'], function() {
  gulp.watch('./src/@(site|layouts)/**/*', ['html']);
});

gulp.task('serve', ['html'], serve({
  root: './dest',
  port: 8080
}));

gulp.task('default', ['html']);
