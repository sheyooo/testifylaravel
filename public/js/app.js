//"use strict";

var app = angular.module('testify', ['ngMaterial',
    'chieffancypants.loadingBar',
    'ngAnimate',
    'ngMessages',
    'angularMoment',
    'ui.router',
    'ngStorage',
    'restangular',
    'facebook',
    'ngFileUpload',
    'ngImgCrop',
    'ngTextTruncate',
    'emojiApp'
]);

//app.constant('apiBase', "http://localhost/testify/api");
app.constant('appUrl', "https://testify-for-testimonies.herokuapp.com");
app.constant('appBase', "/");
app.constant('apiBase', "http://localhost:8000/api/v1");
//app.constant('apiBase', "https://testify-for-testimonies.herokuapp.com/api");

app.config(function(FacebookProvider, $httpProvider, RestangularProvider, apiBase) {
    FacebookProvider.setAppId(180042792329807);
    RestangularProvider.setBaseUrl(apiBase);

    $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function($q, $location, $localStorage, $rootScope, Auth) {
        return {
            'request': function(config) {
                config.headers = config.headers || {};
                if ($localStorage.token) {
                    config.headers.Authorization = 'Bearer ' + $localStorage.token;
                }
                return config;
            },
            'response': function(response) {
                var t = response.headers('Authorization');
                if (t) {
                    t.replace('Bearer ', '');
                    $localStorage.token = t;
                    //console.log(t);
                }

                return response;
            },
            'responseError': function(response) {
                if (response.status === 401 || response.status === 400 || response.status === 403) {
                    if (response.data.error == 'token_expired') {
                        delete $localStorage.token;
                        Auth.resetProfile();
                        $location.path('/signin');
                    } else if (response.data.error == 'token_invalid') {
                        delete $localStorage.token;
                        Auth.resetProfile();
                        $location.path('/signin');
                    } else if (response.data.error == 'Bad Authorization') {
                        delete $localStorage.token;
                        Auth.resetProfile();
                        $location.path('/signin');
                    } else if (response.data.error == 'token_not_provided') {
                        delete $localStorage.token;
                        Auth.resetProfile();
                        $location.path('/signin');
                    }



                    console.log("Unauthorized or forbidden");

                }
                return $q.reject(response);
            }
        };
    }]);
});

app.run(function() {
    // Cut and paste the "Load the SDK" code from the facebook javascript sdk page.

    // Load the facebook SDK asynchronously
    /*(function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));*/
});

app.config(function($mdThemingProvider) {
    var myPaletteMap = $mdThemingProvider.extendPalette('blue', {

        'contrastDefaultColor': 'light',
        'contrastDarkColors': '200, 300',
        'contrastLightColors': '500',
        '500': '97B6CA',
        '50': '1C3456',
        '100': '5DADE0',
        '200': 'e74c3c',
        '300': 'FFFFFF',
        '400': 'F4F4F4',
        '600': '27ae60',
        '700': '77777E'
    });
    $mdThemingProvider.definePalette('palette', myPaletteMap);
    //console.log(myPaletteMap);
    $mdThemingProvider.theme('default')
        .primaryPalette('palette', {
            'default': '500',
            'hue-1': '50',
            'hue-2': '100',
            'hue-3': '300',
        })
        .accentPalette('palette', {
            'default': '200',
            'hue-1': '600',
            'hue-2': '700'

        })
        .warnPalette('red', {

        });

    $mdThemingProvider.theme('input', 'default')
        .primaryPalette('grey', {

        })
        .backgroundPalette('palette', {
            'default': '500'
        }).dark();

    $mdThemingProvider.theme('search', 'default')
        .primaryPalette('yellow', {

        })
        .backgroundPalette('palette', {
            'default': '50'
        }).dark();

    ///$mdIconProvider.defaultFontSet("mdi", "mdi-");
});

app.config(function($stateProvider, $urlRouterProvider, $locationProvider, appBase) {
    $stateProvider
        .state('web', {
            //url: appBase,
            abstract: true,
            templateUrl: 'views/web.html'
        }).state('web.app', {
            abstract: true,
            url: appBase,
            templateUrl: 'views/web.app.html'
        }).state('web.app.login', {
            url: 'login',
            templateUrl: 'views/web.app.login.html',
        }).state('web.app.signup', {
            url: 'signup',
            controller: 'LoginCtrl',
            templateUrl: 'views/web.app.signup.html',
            data: {
                showSideNav: false
            }
        }).state('web.app.logout', {
            url: 'logout',

            controller: 'LogoutCtrl',
            template: " ",
            data: {
                showSideNav: false
            }
        }).state('web.app.landing', {
            url: '',
            templateUrl: 'views/web.app.landing.html',
        }).state('web.app.dashboard', {
            abstract: true,
            url: '',
            templateUrl: 'views/web.app.dashboard.html',
        }).state('web.app.dashboard.home', {
            url: 'home',
            templateUrl: 'views/web.app.dashboard.home.html'
        }).state('web.app.dashboard.post', {
            url: 'post/:hash_id',
            templateUrl: 'views/web.app.dashboard.post.html'
        }).state('web.app.dashboard.posts', {
            url: 'posts?cat',
            templateUrl: 'views/web.app.dashboard.home.html'
        }).state('web.app.dashboard.user', {
            url: 'user/:hash_id',
            resolve: {
                profile: function($stateParams, Restangular) {
                    return Restangular.one('users', $stateParams.hash_id).get();
                }
            },
            views: {
                '': {
                    templateUrl: "views/web.app.dashboard.profile.html",
                    controller: 'ProfileCtrl',
                },
                '@web.app.dashboard.user': {
                    templateUrl: 'views/web.app.dashboard.profile.activities.html',
                }
            }
        }).state('web.app.dashboard.user.activities', {
            url: '/activities',
            templateUrl: 'views/web.app.dashboard.profile.activities.html',
        }).state('web.app.dashboard.user.favorites', {
            url: '/favorites',
            templateUrl: 'views/web.app.dashboard.profile.favorites.html',
        }).state('web.app.dashboard.user.taps', {
            url: '/taps',
            templateUrl: 'views/web.app.dashboard.profile.taps.html',
        }).state('web.app.dashboard.user.edit', {
            url: '/edit',
            views: {
                '@web.app.dashboard': {
                    templateUrl: 'views/web.app.dashboard.profile.edit.html'

                }
            }
        });

    $urlRouterProvider.otherwise(appBase + "home");

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
});
