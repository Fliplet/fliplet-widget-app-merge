const gulp = require('gulp');
const del = require('del');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./config/webpack.config.js');

const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

// Clean assets
function clean() {
  return del(['dist/']);
}

// SASS task
function scss() {
  return gulp
    .src('src/scss/index.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([tailwindcss, autoprefixer]))
    .pipe(gulp.dest('dist/css/'));
}

// JS & VUE task
function js() {
  return gulp
    .src('src/main.js')
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest('dist/'));
}

// Watch files
function watchFiles() {
  gulp.watch('src/scss/**/*', scss);
  gulp.watch('src/main.js', js);
  gulp.watch('src/store/index.js', js);
  gulp.watch('src/**/*.vue', js);
}

const build = gulp.series(clean, gulp.parallel(scss, js));
const watch = gulp.parallel(watchFiles);

exports.build = build;
exports.watch = watch;
