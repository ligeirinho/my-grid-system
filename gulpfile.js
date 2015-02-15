/*
	My template gulp.js
	Version: 1.0.2
	Author: Tiago Porto - http://www.tiagoporto.com
	https://github.com/tiagoporto
	Contact: me@tiagoporto.com
*/

//************************* Load dependencies ****************************//

var		  gulp = require('gulp'),
		uglify = require('gulp-uglify'),
		rename = require('gulp-rename'),
		csso = require('gulp-csso'),
  autoprefixer = require('gulp-autoprefixer'),
		 clean = require('gulp-clean'),
		concat = require('gulp-concat'),
		plumber = require('gulp-plumber'),
		notify = require('gulp-notify'),
	   stylus = require('gulp-stylus'),
		 watch = require('gulp-watch'),
	livereload = require('gulp-livereload'),
			lr = require('tiny-lr'),
		server = lr();

//***************************** Path configs *****************************//

var	   public_path = 'project/', // public files
	 public_images = public_path + 'img', // optimized images
	 public_styles = public_path + 'css', // minified styles
	public_scripts = public_path + 'js', // concat and minify scripts
	   stylus_path = 'src/stylesheets/', // stylus files
		 js_path   = 'src/scripts/', // js files
		 img_path  = 'src/images/'; // original image files


//******************************** Tasks *********************************//

// Concat and Minify Scripts
gulp.task('scripts', function() {
	gulp.src([js_path + '/libs/**',
		      js_path + 'frameworks/**',
		      js_path + 'plugins/**',
		      js_path + 'onread/open_onread.js',
		      js_path + '/**/*.js',
		      js_path + 'onread/close_onread.js'])
		.pipe(plumber())
		.pipe(concat('main.js'))
		.pipe(gulp.dest(public_scripts))
		.pipe(rename('main.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(public_scripts))
		.pipe(livereload(server));
});

// Compile and Prefix Stylus Styles
gulp.task('stylus', function () {
	return	gulp.src([
					stylus_path + '*.styl',
					'!' + stylus_path + '_*.styl',
				])
				.pipe(stylus({'include css': true}))
				.pipe(autoprefixer({
					browsers: ['ie >= 8', 'ie_mob >= 10', 'Firefox > 24', 'last 10 Chrome versions', 'safari >= 6', 'opera >= 24', 'ios >= 6',  'android >= 4', 'bb >= 10']
				}))
				.pipe(gulp.dest(public_styles))
				.pipe(csso())
				.pipe(rename({suffix: '.min'}))
				.pipe(gulp.dest(public_styles))
				.pipe(notify({message: 'Styles task complete', onLast: true}));
});

// Clean Directories
gulp.task('clean', function() {
	return gulp.src([public_styles,
					 public_scripts,
					 public_images], {read: false})
		.pipe(clean());
});

// Reload Browser
gulp.task('reload-browser', function() {
	gulp.src(public_path + '**/*.{html,php}')
		.pipe(livereload(server));
});

// Watch
gulp.task('watch', function() {
	//Listen on port 35729
	server.listen(35729, function (err) {
		if (err) return console.log(err);

		// Watch .js files
		gulp.watch(js_path + '**/*.js', function(event) {
			gulp.run('scripts');
		});

		// Watch stylus files
		gulp.watch(stylus_path + '**/*.styl', function(event) {
			gulp.run('stylus');
		});

		//Watch .html .php Files
		gulp.watch(public_path + '**/*.{html,php}', function(){
			gulp.run('reload-browser');
		});

	});
});

// Default task
gulp.task('default', ['clean', 'stylus', 'scripts'], function() {
	gulp.run('watch');
});