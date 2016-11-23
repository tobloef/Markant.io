/* eslint-disable import/no-extraneous-dependencies */
const gulp = require("gulp");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const browserify = require("browserify");
const browserifyCss = require("browserify-css");
const del = require("del");
const eslint = require("gulp-eslint");
const csslint = require("gulp-csslint");
const uglify = require("gulp-uglify");
const babel = require("gulp-babel");
const rename = require("gulp-rename");
const sourcemaps = require('gulp-sourcemaps');

const destDir = "./build";
const entryPoints = ["app"];

gulp.task("default", ["browserify", "font-awesome", "codemirror-themes", "highlight.js-styles"]);

gulp.task("browserify", function() {
	entryPoints.forEach(function(file) {
		const b = browserify({
			entries: [`./scripts/${file}.js`],
			debug: true,
		});

		b.transform(browserifyCss);

		return b.bundle()
			.pipe(source(`${file}-bundle.js`))
			.pipe(buffer())
			.pipe(sourcemaps.init({loadMaps: true}))
			.pipe(sourcemaps.write("./"))
			.pipe(gulp.dest(destDir));
	});
});

gulp.task("minify", ["browserify", "font-awesome"], function() {
	entryPoints.forEach(function(file) {
		gulp.src([`build/${file}-bundle.js`])
			.pipe(buffer())
			.pipe(babel({
				presets: ["es2015"],
			}))
			.pipe(uglify())
			.pipe(rename({ suffix: ".min" }))
			.pipe(gulp.dest(function(filename) {
				return filename.base;
			}));
	});
});

gulp.task("font-awesome", function() {
	const destDir = "./build/lib/font-awesome";
	gulp.src(["node_modules/font-awesome/{css,fonts}/**/*"])
		.pipe(gulp.dest(destDir));
});

gulp.task("codemirror-themes", function() {
	const destDir = "./build/lib/codemirror/theme";
	gulp.src([
			"node_modules/codemirror/theme/*.css",
			"styles/editor/themes/*.css",
			"styles/editor/*.css"
		])
		.pipe(gulp.dest(destDir));
});

gulp.task("highlight.js-styles", function() {
	const destDir = "./build/lib/highlight.js/styles";
	gulp.src(["node_modules/highlight.js/styles/*.css"])
		.pipe(gulp.dest(destDir));
});

gulp.task("watch", function() {
	gulp.start(["default"]);
	gulp.watch(["scripts/**/*", "styles/**/*"], ["default"]);
});

gulp.task("clean", function() {
	return del(["build"]);
});

gulp.task("jslint", function() {
	return gulp.src(["scripts/**/*.js", "gulpfile.js"])
		.pipe(eslint())
		.pipe(eslint.formatEach())
		.pipe(eslint.failAfterError());
});

gulp.task("csslint", function() {
	return gulp.src(["**/*.css", "!node_modules/**", "!build/**/*"])
		.pipe(csslint())
		.pipe(csslint.formatter())
		.pipe(csslint.failFormatter());
});

gulp.task("lint", function() {
	gulp.start(["jslint", "csslint"]);
});