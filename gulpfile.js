var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  uglify = require('gulp-uglify'),
  sourcemaps = require('gulp-sourcemaps'),
  concat = require('gulp-concat'),
  ngAnnotate = require('gulp-ng-annotate'),
  mainBowerFiles = require('main-bower-files'),
  sass = require('gulp-sass'),
  htmlReplace = require('gulp-html-replace'),
  tCache = require('gulp-angular-templatecache'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  jpegtran = require('imagemin-jpegtran');

var bower_js_files = [
  "public/bower_components/jquery/dist/jquery.min.js",
  "public/bower_components/fastclick/lib/fastclick.js",
  "public/bower_components/angular/angular.min.js",
  "public/bower_components/angular-sanitize/angular-sanitize.min.js",
  "public/bower_components/angular-ui-router/release/angular-ui-router.min.js",
  "public/bower_components/angular-messages/angular-messages.min.js",
  "public/bower_components/underscore/underscore.min.js",
  "public/bower_components/lodash/lodash.min.js",
  "public/bower_components/angular-facebook/lib/angular-facebook.js",
  "public/bower_components/angular-animate/angular-animate.min.js",
  "public/bower_components/restangular/dist/restangular.min.js",
  "public/bower_components/ngstorage/ngStorage.min.js",
  "public/bower_components/angular-aria/angular-aria.min.js",
  "public/bower_components/angular-material/angular-material.min.js",
  "public/bower_components/angular-loading-bar/build/loading-bar.min.js",
  "public/bower_components/moment/min/moment.min.js",
  "public/bower_components/angular-moment/angular-moment.min.js",
  "public/plugins/ng-text-truncate/ng-text-truncate.js",
  "public/bower_components/ng-file-upload/ng-file-upload.min.js",
  "public/bower_components/ng-img-crop/compile/minified/ng-img-crop.js",
  "public/bower_components/angular-emoji-popup/dist/js/config.js",
  "public/bower_components/angular-emoji-popup/dist/js/emoji.min.js"
];

var template_files = [
  'public/**/*.html',
  '!public/bower_components/**',
  '!public/index.html',
];

var bower_css_files = [];

var cordova_www = [
  'public/bower_components/angular-material/angular-material.min.css',
  'public/bower_components/mdi/**/**',
  'public/bower_components/angular-emoji-popup/**/**',
  'public/dist/**/**',
  'public/partials/**/**',
  'public/views/**/**',
  'public/plugins/**/**',
  'public/img/**/**',
  'public/index.html'
];

var sass_files = [
  'public/plugins/override/angular-loading-bar/loading-bar.css',
  'public/css/scss/app.scss',
  'public/css/main.css',
  "public/bower_components/ng-img-crop/compile/minified/ng-img-crop.css",
  'public/bower_components/animate.css/animate.min.css',
  'public/css/ux-animations.css'
];

var img_asset_files = [
  'public/img/1.jpg',
  'public/img/concert.jpg',
  'public/img/guest.png',
  'public/img/small-logo.png',
  'public/img/testify.png',
  'public/img/testify_motto.png',
  'public/img/**'
];


gulp.task('js', function() {
  return gulp.src(['public/js/**/*.js'])
    .pipe(sourcemaps.init({
      debug: true
    }))
    .pipe(ngAnnotate())
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(uglify())
    .pipe(concat('app.js'))
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('public/dist/js/'));
});

gulp.task('css', function() {
  return gulp.src(sass_files)
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(concat('all.css'))
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('public/dist/css/'));
});

gulp.task('img_assets', function() {
  return gulp.src(img_asset_files)
    .pipe(imagemin({
      progressive: true,
      use: [pngquant(), jpegtran()]
    }))
    .pipe(gulp.dest('public/img/'))
    .pipe(gulp.dest('public/dist/img/'));
});

gulp.task('js_libs', function() {
  return gulp.src(bower_js_files)
    .pipe(sourcemaps.init())
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(concat('libs.js'))
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('public/dist/js/'));
});

gulp.task('tCache', function(){
  return gulp.src(template_files)
  .pipe(tCache({
    module: 'testify'
  }))
  .pipe(uglify())
  .pipe(gulp.dest('public/dist/js/'));
});

gulp.task('watch', function() {
  gulp.watch(['public/js/**/*.js'], ['js']);
  gulp.watch(sass_files, ['css']);
  gulp.watch(template_files, ['tCache']);

});

gulp.task('build', ['js', 'css', 'js_libs', 'tCache', 'img_asset']);

gulp.task('cordova_sync', function(){
  return gulp.src(cordova_www, {base: 'public/'})
  .pipe(gulp.dest('cordova/www/'));
});

gulp.task('cordovalize_index', function(){
  return gulp.src('public/index.html')
  .pipe(htmlReplace({
    'cordova': "<script src=\'cordova.js\'></script>\n<meta http-equiv=\"Content-Security-Policy\" content=\"default-src *; style-src 'self' 'unsafe-inline' http: *; script-src 'self' 'unsafe-inline' 'unsafe-eval' *; font-src http: file: ;\">",
    'url-base': '',
    'font-url': '<link href=\'http://fonts.googleapis.com/css?family=Roboto:400,500,700,400italic\' rel=\'stylesheet\'>'
  }))
  .pipe(gulp.dest('cordova/www/'));
});
