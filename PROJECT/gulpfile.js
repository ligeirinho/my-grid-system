/*
	My Gulp.js Template
	Version: 3.0.0beta Light
	Author: Tiago Porto - http://www.tiagoporto.com
	https://github.com/tiagoporto/my-gulp-template
	Contact: me@tiagoporto.com
*/

'use strict';

//************************* Load dependencies ****************************//
var		   gulp = require('gulp'),
   autoprefixer = require('gulp-autoprefixer'),
	browserSync = require('browser-sync'),
		  cache = require('gulp-cached'),
		 concat = require('gulp-concat'),
		   csso = require('gulp-csso'),
			del = require('del'),
		 gulpif = require('gulp-if'),
	   imagemin = require('gulp-imagemin'),
		  merge = require('merge-stream'),
	 minifyHTML = require('gulp-minify-html'),
		plumber = require('gulp-plumber'),
		replace = require('gulp-replace'),
		 rename = require('gulp-rename'),
	   sequence = require('run-sequence'),
	spritesmith = require('gulp.spritesmith'),
	  svgSprite = require('gulp-svg-sprite'),
		 stylus = require('gulp-stylus'),
		 uglify = require('gulp-uglify'),
		 useref = require('gulp-useref'),

//***************************** Path configs *****************************//
	basePaths = {
		   src: 'src/',
		  dest: 'public/',
		 build: '../',

		images: {
			 src: 'images/',
			dest: 'images/' // If change this directory remember to modify
							// the variable $image-path in
							// 'src/stylesheets/helpers/_variables.styl'
		},

		sprite: {
			bitmap: 'sprite/',
			   svg: 'svg-sprite/'
		},

		scripts: {
			 src: 'scripts/',
			dest: 'js/'
		},

		styles: {
			 src: 'stylesheets/',
			dest: 'css/'
		}
	},

	paths = {
		images: {
			  src: basePaths.src + basePaths.images.src ,
			 dest: basePaths.dest + basePaths.images.dest,
			build: basePaths.build + basePaths.images.src
		},

		sprite: {
			  bitmap: basePaths.src + basePaths.images.src + basePaths.sprite.bitmap,
			 svg: basePaths.src + basePaths.images.src + basePaths.sprite.svg
		},

		scripts: {
			  src: basePaths.src + basePaths.scripts.src,
			 dest: basePaths.dest + basePaths.scripts.dest,
			build: basePaths.build + basePaths.scripts.dest
		},

		styles: {
			  src: basePaths.src + basePaths.styles.src,
			 dest: basePaths.dest + basePaths.styles.dest,
			build: basePaths.build + basePaths.styles.dest
		}
	},

//************************ browserSync config ***************************//

	browserSyncConfig = {
		notify: false,
		port: 80,
		logPrefix: 'BrowserSync',
		// To use with dinamic files
		// proxy: 'localhost/my-gulp-template/public/'
		server: {
			baseDir: [basePaths.src, basePaths.dest]
		}
	}

//******************************** Tasks *********************************//

// Generate Bitmap Sprite
gulp.task('bitmap-sprite', function () {
	var sprite = gulp.src(paths.sprite.bitmap + '**/*.png')
					.pipe(
						spritesmith({
							imgName: 'sprite.png',
							cssName: '_sprite.styl',
							imgPath: '../' + basePaths.images.dest + 'sprite.png',
							padding: 2,
							algorithm: 'top-down'
						})
					);

	sprite.img
		.pipe(imagemin())
		.pipe(gulp.dest(paths.images.dest));
	sprite.css
		.pipe(gulp.dest(paths.styles.src + 'helpers'));

	return sprite;
});

// Generate SVG Sprite
gulp.task('svg-sprite', function() {
	return gulp.src(paths.sprite.svg + '*.svg')
				.pipe(plumber())
				.pipe(svgSprite({
					shape : {
						spacing : {
							padding : 2
						}
					},
					mode : {
						css : {
							dest : './',
							sprite: '../' + basePaths.images. dest + 'svg-sprite.svg',
							layout: 'vertical',
							bust : false,
							render : {
								styl : {dest: '../../' + paths.styles.src + 'helpers/_svg-sprite.styl'}
							}
						}
					}
				}))
				.pipe(gulp.dest(paths.images.dest));
});

// Optimize Images
gulp.task('images', function () {
	return gulp.src([
				paths.images.src + '**/*.{bmp,gif,jpg,jpeg,png,svg}',
				'!' + paths.sprite.bitmap + '**/*',
				'!' + paths.sprite.svg + '**/*'
			])
			.pipe(cache('imagemin'))
			.pipe(imagemin({optimizationLevel: 5, progressive: true}))
			.pipe(gulp.dest(paths.images.dest));

});

// Concatenate Stylus Mixins and Functions
gulp.task('stylus-helpers', function () {
	   var mixins = gulp.src(paths.styles.src + 'helpers/mixins/*.styl')
						.pipe(concat('_mixins.styl'))
						.pipe(gulp.dest(paths.styles.src + 'helpers'));

	var functions = gulp.src(paths.styles.src + 'helpers/functions/*.styl')
						.pipe(concat('_functions.styl'))
						.pipe(gulp.dest(paths.styles.src + 'helpers'));

	return merge(mixins, functions);
});

// Compile and Prefix Stylus Styles
gulp.task('stylus', function () {
	return	gulp.src([
					paths.styles.src + '*.styl',
					'!' + paths.styles.src + '_*.styl',
				])
				.pipe(plumber())
				.pipe(stylus({'include css': true}))
				.pipe(autoprefixer({
					browsers: ['ie >= 8', 'ie_mob >= 10', 'Firefox > 24', 'last 10 Chrome versions', 'safari >= 6', 'opera >= 24', 'ios >= 6',  'android >= 4', 'bb >= 10']
				}))
				.pipe(gulp.dest(paths.styles.dest))
				.pipe(csso())
				.pipe(rename({suffix: '.min'}))
				.pipe(gulp.dest(paths.styles.dest));
});

// Concatenate libs, frameworks, plugins Scripts and Minify
gulp.task('dependence-scripts', function () {
	return	gulp.src([
					paths.scripts.src + 'dependencies/plugins/outdatedbrowser.js',
					paths.scripts.src + 'dependencies/libs/*',
					paths.scripts.src + 'dependencies/frameworks/*',
					paths.scripts.src + 'dependencies/plugins/**'
				])
				.pipe(concat('dependencies.js'))
				.pipe(gulp.dest(paths.scripts.dest))
				.pipe(rename('dependencies.min.js'))
				.pipe(uglify())
				.pipe(gulp.dest(paths.scripts.dest));
});

// Concatenate and Minify Main Scripts
gulp.task('scripts', function () {
	var concatenate = gulp.src([
							'!' + paths.scripts.src + '**/_*.js',
							paths.scripts.src + 'settings/outdatedbrowser.js',
							paths.scripts.src + 'settings/*.js',
							paths.scripts.src + '*.js',
							paths.scripts.src + 'jquery/onread/open_onread.js',
							paths.scripts.src + 'jquery/*',
							paths.scripts.src + 'jquery/onread/close_onread.js',
							paths.scripts.src + 'angular/**',
							paths.scripts.src + 'settings/google_analytics.js'
						])
						.pipe(plumber())
						.pipe(concat('main.js'))
						.pipe(gulp.dest(paths.scripts.dest))
						.pipe(rename({suffix: '.min'}))
						.pipe(uglify(
						// Required to minify angularjs scripts
						// {mangle: false}
						))
						.pipe(gulp.dest(paths.scripts.dest));

		   var copy = gulp.src([
							paths.scripts.src + 'angular/_*.js',
							paths.scripts.src + 'jquery/_*.js',
							paths.scripts.src + '/_*.js'
						])
						.pipe(plumber())
						.pipe(rename(function(path){
							path.basename = path.basename.substring(1)
						}))
						.pipe(gulp.dest(paths.scripts.dest))
						.pipe(rename({suffix: '.min'}))
						.pipe(uglify({
							preserveComments: 'some'
							// Required to minify angularjs scripts
							// , mangle: false
						}))
						.pipe(gulp.dest(paths.scripts.dest));

	return merge(concatenate, copy);
});

// Copy Files to Build
gulp.task('copy', function () {
	var assets   =  useref.assets();

	// Minify and Copy HTML
	var  html    =   gulp.src(basePaths.dest + '**/*.{html,php}')
						.pipe(assets)
						.pipe(gulpif('*.js', uglify(
							// Required to minify angularjs scripts
							// {mangle: false}
						)))
						.pipe(gulpif('*.css', csso()))
						.pipe(assets.restore())
						.pipe(useref())
						.pipe(gulpif('*.html', minifyHTML({spare:true, empty: true})))
						.pipe(gulpif('*.php', minifyHTML({spare:true, empty: true})))
						.pipe(gulp.dest(basePaths.build));

	// Copy All Other files except HTML, PHP, CSS e JS Files
	var AllFiles =	gulp.src([
							basePaths.dest + '**/*',
							'!' + paths.styles.dest + '**/*',
							'!' + paths.scripts.dest + '**/*',
							'!' + basePaths.dest + '**/*.{html,php}'
						], {dot: true})
						.pipe(gulp.dest(basePaths.build));
});

//*************************** Utility Tasks ******************************//

// Clean Directories
gulp.task('clean', function (cb) {
	del([
		paths.styles.dest,
		paths.scripts.dest,
		paths.images.dest + '**/*',
		'!' + paths.images.dest + 'copyright{,**/*{,**/*}}',
		], cb)
});

// Watch
gulp.task('watch', function () {
	browserSync(browserSyncConfig);

	// Watch .jpg .png .gif and .svg files
	gulp.watch([paths.images.src + '**/*.{png,jpg,gif,svg}', '!' + paths.sprite.bitmap + '**/*', '!' + paths.sprite.svg + '**/*'], ['images', browserSync.reload]);

	// Watch bitmap sprite files
	gulp.watch(paths.sprite.bitmap + '**/*.{png,jpg,gif}', ['bitmap-sprite', browserSync.reload]);

	// Watch svg sprite files
	gulp.watch(paths.sprite.svg + '**/*.svg', ['svg-sprite', 'stylus', browserSync.reload]);

	// Watch .js files
	gulp.watch([paths.scripts.src + '**/*.js', '!' + paths.scripts.src + 'dependencies/**/*.js'], ['scripts', browserSync.reload]);

	// Watch dependencies .js files
	gulp.watch(paths.scripts.src + 'dependencies/**/*.js', ['dependence-scripts', browserSync.reload]);

	// Watch .styl files
	gulp.watch([paths.styles.src + '**/*.{styl,css}', '!' + paths.styles.src + 'helpers/mixins/*.styl', '!' + paths.styles.src + 'helpers/functions/*.styl'], ['stylus', browserSync.reload]);

	// Watch .styl Helpers and Functions files
	gulp.watch([paths.styles.src + 'helpers/mixins/*.styl', paths.styles.src + 'helpers/functions/*.styl'], ['stylus-helpers']);

	//Watch .html and .php Files
	gulp.watch(basePaths.dest + '**/*.{html,php}', browserSync.reload);
});

//***************************** Main Tasks *******************************//

// Compile, watch and serve project
gulp.task('default', ['clean'], function (cb) {
	sequence(['images', 'bitmap-sprite', 'svg-sprite', 'stylus-helpers', 'dependence-scripts'], 'stylus', 'scripts', 'watch',  cb);
});

// Compile project
gulp.task('compile', ['clean'], function (cb) {
	sequence(['images', 'bitmap-sprite', 'svg-sprite', 'stylus-helpers', 'dependence-scripts'], 'stylus', 'scripts', cb);
});

// Build Project
gulp.task('build', ['clean'], function (cb) {
	sequence(['images', 'bitmap-sprite', 'svg-sprite'], 'stylus-helpers', 'stylus', 'dependence-scripts', 'scripts', 'copy', cb);
});

// Build and serve Builded Project
gulp.task('build:serve', ['build'], function (cb) {
	browserSync(browserSyncConfig);
});
