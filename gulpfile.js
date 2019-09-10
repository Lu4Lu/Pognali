"use strict";

var gulp = require("gulp");
var imagemin = require("gulp-imagemin");
var svgstore = require("gulp-svgstore");
var webp = require("gulp-webp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var rename = require("gulp-rename");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var csso = require("gulp-csso");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var del = require("del");
var server = require("browser-sync").create();

gulp.task("clean", function() {
  return del("build");
});

gulp.task("images", function() {
  return gulp
    .src("source/img/**/*.{png, jpg,svg}")
    .pipe(
      imagemin([
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.svgo()
      ])
    )
    .pipe(gulp.dest("source/img"));
});

gulp.task("webp", function() {
  return gulp
    .src("source/img/**/*.{png,jpg}")
    .pipe(webp({ quality: 75 }))
    .pipe(gulp.dest("source/img"));
});

gulp.task("sprite", function() {
  return gulp
    .src("source/img/svg/icon-*.svg")
    .pipe(
      svgstore({
        inlineSvg: true
      })
    )
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("html", function() {
  return gulp
    .src("source/*.html")
    .pipe(posthtml([include()]))
    .pipe(gulp.dest("build"));
});

gulp.task("css", function() {
  return gulp
    .src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer()]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("copy", function() {
  return gulp
    .src(
      [
        "source/fonts/**/*.{woff,woff2}",
        "source/img/**",
        "source/js/**",
        "source/*.ico"
      ],
      {
        base: "source"
      }
    )
    .pipe(gulp.dest("build"));
});

gulp.task("js", function() {
  return gulp
    .src("source/js/script.js")
    .pipe(uglify())
    .pipe(rename("script.min.js"))
    .pipe(gulp.dest("build/js"));
});

gulp.task("refresh", function(done) {
  server.reload();
  done();
});

gulp.task("server", function() {
  server.init({
    server: "build/"
  });
  gulp.watch("source/sass/**/*.scss", gulp.series("css"));
  gulp.watch(
    "source/img/svg/icon-*.svg",
    gulp.series("sprite", "html", "refresh")
  );
  gulp.watch("source/*.html", gulp.series("html", "refresh"));
});

gulp.task("build", gulp.series("clean", "copy", "css", "sprite", "html"));
gulp.task("start", gulp.series("build", "css", "server", "refresh"));