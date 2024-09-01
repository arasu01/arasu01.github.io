const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');

gulp.task('minify-css', () => {
    return gulp.src('css/*.css') // Adjust the source path as needed
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(gulp.dest('css'));
});

gulp.task('minify-js', () => {
    return gulp.src('js/*.js') // Adjust the source path as needed
        .pipe(uglify())
        .pipe(gulp.dest('js'));
});

gulp.task('default', gulp.parallel('minify-css', 'minify-js'));