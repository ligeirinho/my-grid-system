// Load plugins
var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	imagemin = require('gulp-imagemin'),
	rename = require('gulp-rename'),
	clean = require('gulp-clean'),
	concat = require('gulp-concat'),
	sass = require('gulp-sass'),
	path = require('path'),
	watch = require('gulp-watch'),
	livereload = require('gulp-livereload'),
	lr = require('tiny-lr'),
	server = lr();

// Path configs
var	css_path  = 'project/css/**/*.css', // .css files
	sass_path = 'src/stylesheets/sass/**/*.scss', // .sass files
	img_path  = 'src/images/**/*.{png,jpg,gif}'; // image files


//**********************************Tasks**********************************//

// Optimize Images
gulp.task('images', function() {
	gulp.src([img_path, '!src/images/icons/*' ])
		.pipe(imagemin({ optimizationLevel: 3, progressive: true, cache: true }))
		.pipe(gulp.dest('project/img'))
		.pipe(livereload(server));
});


gulp.task('sass', function () {
    gulp.src([sass_path,  '!src/stylesheets/sass/media_queries/*'])
        .pipe(sass())
        .pipe(gulp.dest('project/css'))
        .pipe(livereload(server));
});

// Clean Directories
gulp.task('clean', function() {
	return gulp.src(['project/css', 'project/img'], {read: false})
		.pipe(clean());
});

// Reload Browser
gulp.task('reload-browser', function() {
	gulp.src('project/**/*.html')
		.pipe(livereload(server));
});

//Watch
gulp.task('watch', function() {
	//Listen on port 35729
	server.listen(35729, function (err) {
		if (err) return console.log(err);

		// Watch .scss files
		gulp.watch(sass_path, function(event) {
			gulp.run('sass');
		});

		// Watch .jpg .png .gif files
		gulp.watch(img_path, function(event) {
		  gulp.run('images');
		});

		//Watch .html .php Files
		gulp.watch('project/**/*.{html,php}', function(){
			gulp.run('reload-browser');
		});

	});
});

// Default task
gulp.task('default', ['clean', 'sass', 'images'], function() {
	gulp.run('watch');
});
