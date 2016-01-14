var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    ngAnnotate = require('gulp-ng-annotate'),
    mainBowerFiles = require('main-bower-files'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync');

var bower_js_files = ["bower_components/jquery/dist/jquery.min.js",
    "bower_components/angular/angular.min.js",
    "bower_components/angular-sanitize/angular-sanitize.min.js",
    "bower_components/angular-ui-router/release/angular-ui-router.min.js",
    "bower_components/angular-messages/angular-messages.min.js",
    "bower_components/lodash/lodash.min.js",
    "bower_components/angular-facebook/lib/angular-facebook.js",
    "bower_components/angular-animate/angular-animate.min.js",
    "bower_components/restangular/dist/restangular.min.js",
    "bower_components/ngstorage/ngStorage.min.js",
    "bower_components/angular-aria/angular-aria.min.js",
    "bower_components/angular-material/angular-material.min.js",
    "bower_components/angular-loading-bar/build/loading-bar.min.js",
    "bower_components/moment/min/moment.min.js",
    "bower_components/angular-moment/angular-moment.min.js",
    "plugins/ng-text-truncate/ng-text-truncate.js",
    "bower_components/ngEmbed/dist/ng-embed.min.js",
    "bower_components/ng-file-upload/ng-file-upload.min.js",
    "bower_components/ng-img-crop/compile/minified/ng-img-crop.js",
    "bower_components/angular-emoji-popup/dist/js/config.js",
    "bower_components/angular-emoji-popup/dist/js/emoji.min.js",
    "bower_components/angular-elastic/elastic.js"
];

var bower_css_files = [];

var sass_files = [

    'plugins/override/angular-loading-bar/loading-bar.css',
    'css/scss/app.scss',
    'css/main.css',
    "bower_components/ng-img-crop/compile/minified/ng-img-crop.css",
    'bower_components/animate.css/animate.min.css',
    'css/ux-animations.css'
];

var img_asset_files = [
    'img/1.jpg',
    'img/concert.jpg'
];


gulp.task('js', function() {
    return gulp.src(['js/**/*.js'], {
            base: 'js'
        })
        .pipe(sourcemaps.init({
            debug: true
        }))
        .pipe(ngAnnotate())
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(uglify())
        .pipe(concat('app.js'))
        .pipe(sourcemaps.write('../maps'))
        .pipe(gulp.dest('dist/js/'));
});

gulp.task('css', function() {
    gulp.src(sass_files)
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        //.pipe(uglify())
        .pipe(concat('all.css'))
        .pipe(sourcemaps.write('../maps'))
        .pipe(gulp.dest('dist/css/'));
});

gulp.task('img_asset', function() {
    gulp.src(img_asset_files)
        .pipe(gulp.dest('dist/img/'));
});

gulp.task('js_libs', function() {
    return gulp.src(bower_js_files)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat('libs.js'))
        .pipe(sourcemaps.write('../maps'))
        .pipe(gulp.dest('dist/js/'));
});

gulp.task('watch', function() {
    gulp.watch(['js/**/*.js'], ['js']);
    gulp.watch(sass_files, ['css']);

});
