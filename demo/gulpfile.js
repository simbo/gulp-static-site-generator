'use strict';

var del = require('del'),
    gulp = require('gulp'),
    serve = require('gulp-serve'),
    staticSiteGenerator = require('..');

gulp.task('ssg', ['clean'], function() {
  return gulp.src('./src/site/**/*')
    .pipe(staticSiteGenerator({
      defaultLayout: 'base.jade',
      layoutPath: 'src/layouts',
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
  gulp.watch('./src/@(site|layouts)/**/*', ['ssg']);
});

gulp.task('serve', ['ssg'], serve({
  root: './dest',
  port: 8080
}));

gulp.task('default', ['ssg']);
