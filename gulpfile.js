var gulp = require("gulp"),
  $ = require("gulp-load-plugins")();


//////////////////

/*
Styles
 */
const baseConfig = {
  baseDir: "static/",
  maxSize: 14 * 1024,
  debug: false
};

//single css files
gulp.task("styles_single", function () {
  return gulp
    .src(["lib/styles/*.less", "lib/styles/*.css"])
    .pipe($.sourcemaps.init())
    .pipe($.less())
    .pipe($.inlineBase64(baseConfig))
    .pipe(
      $.autoprefixer({
        browsers: ["> 5%"]
      })
    )
    .pipe($.sourcemaps.write("."))
    .pipe(gulp.dest("dist/styles"));
});

//merged css
gulp.task("styles", function () {
  return gulp
    .src(["lib/styles/main/*.less", "lib/styles/main/*.css"])
    .pipe($.sourcemaps.init())
    .pipe($.concat("main.css"))
    .pipe($.less())
    .pipe($.inlineBase64(baseConfig))
    .pipe(
      $.autoprefixer({
        browsers: ["> 5%"]
      })
    )
    .pipe($.sourcemaps.write("."))
    .pipe(gulp.dest("dist/styles"));
});
/*
js
 */
gulp.task("js", function () {
  return (gulp
    .src("lib/js/*.js")
    .pipe($.sourcemaps.init())
    .pipe(
      $.babel({
        presets: ["es2015"]
      })
    )
    //.pipe($.concat('main.js'))
    .pipe($.uglify())
    .pipe($.sourcemaps.write("."))
    .pipe(gulp.dest("dist/js")));
});

/*
html
 */
gulp.task("html", gulp.series("styles", "js", function () {
  return gulp
    .src("lib/index.html")
    .pipe($.inlineSource({ rootpath: "." }))
    .pipe(
      $.htmlmin({
        collapseWhitespace: true,
        sortAttributes: true
      })
    )
    .pipe(gulp.dest("."));
}));

// 用带版本号的资源路径替换不带版本号的资源路径
gulp.task("reveasy", gulp.series("html", function () {
  return gulp
    .src("index.html")
    .pipe(
      $.revEasy({
        patterns: {
          js: {
            regex: /(<script[^>]*?\s+src=)("dist(?:.+?)"|'(?:.+?)')([^>]*?>)/gi
          }
        }
      })
    )
    .pipe(gulp.dest("."));
}));

//default
gulp.task("default", gulp.series("reveasy", function (done) { done() }));

//watch
// gulp.task("watch", gulp.series("default", function (done) {
//   return 
// }));

function watch () {
  gulp.watch("lib/**/*", gulp.series("default"));
}

exports.watch = watch