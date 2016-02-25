gulp = require 'gulp'
$ = do require('gulp-load-plugins')
electron = do require('electron-connect').server.create

srcDir = 'src'
libDir = 'build'

gulp.task 'compile', ->
  gulp.src 'src/client/css/**/*'
  .pipe gulp.dest 'build/css'

  gulp.src 'src/client/fonts/**/*'
  .pipe gulp.dest 'build/fonts'

  gulp.src 'src/client/template/**/*'
  .pipe gulp.dest 'build/template'

  gulp.src 'src/client/images/**/*'
  .pipe gulp.dest 'build/images'


gulp.task 'start', ['compile'], ->
  do electron.start
  gulp.watch "#{srcDir}/**/*.coffee", ['compile', electron.restart]
  gulp.watch ['main.js'], electron.restart
  gulp.watch ['index.jade'], electron.reload
    