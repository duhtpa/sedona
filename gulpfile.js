"use strict";

var gulp          = require("gulp");
var plumber       = require("gulp-plumber");
var rename        = require("gulp-rename");
var del           = require("del");
var server        = require("browser-sync").create();

var sass          = require("gulp-sass");
var sourcemap     = require("gulp-sourcemaps");
var postcss       = require("gulp-postcss");
var autoprefixer  = require("autoprefixer");
var csso          = require("gulp-csso");

var imagemin      = require("gulp-imagemin");
var webp          = require("gulp-webp");
var svgstore      = require('gulp-svgstore');
var svgmin        = require('gulp-svgmin');
var path          = require('path');

gulp.task("css", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("images", function () {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.mozjpeg({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("source/img"));
});

gulp.task("webp", function () {
  return gulp.src("build/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/img"));
});

gulp.task("sprite", function () {
  return gulp.src("build/img/icon-*.svg")
        .pipe(svgmin(function (file) {
            var prefix = path.basename(file.relative, path.extname(file.relative));
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: prefix + "-",
                        minify: true
                    }
                }]
            }
        }))
        .pipe(svgstore())
        .pipe(rename("sprite.svg"))
        .pipe(gulp.dest("build/img"));
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("copy", function () {
  return gulp.src([
    "source/*.ico",
    "source/*.html",
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    // "!source/img/icon-*.svg",
    "source/js/*.js",
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));
});

gulp.task("build", gulp.series(
  "clean",
  "css",
  "copy",
  "webp",
  "sprite"
));

gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.scss", gulp.series("css"));
  gulp.watch("source/*.html", gulp.series("copy", "refresh"));
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("start", gulp.series("build", "server"));
