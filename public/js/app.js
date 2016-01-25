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

var cordova = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
if ( cordova ) {
  app.constant('apiBase', "https://testify-staging.herokuapp.com/api/v1");
  app.constant('appBase', "/");
  app.constant('appUrl', "https://testify-staging.herokuapp.com");

} else {

  app.constant('appUrl', "https://testify-staging.herokuapp.com");
  app.constant('appBase', "/");
  app.constant('apiBase', "api/v1");
}

//app.constant('apiBase', "http://localhost/testify/api");
//app.constant('apiBase', "https://testify-for-testimonies.herokuapp.com/api");
app.config(['$compileProvider', function ($compileProvider) {
  $compileProvider.debugInfoEnabled(false);
}]);
app.config(function(FacebookProvider, $httpProvider, RestangularProvider,
  apiBase) {
  FacebookProvider.setAppId(180042792329807);
  RestangularProvider.setBaseUrl(apiBase);

  $httpProvider.interceptors.push(['$q', '$location', '$localStorage',
    function($q, $location, $localStorage, $rootScope, Auth) {
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
          if (response.status === 401 || response.status === 400 ||
            response.status === 403) {
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
    }
  ]);
});

app.run(function() {
    if ('addEventListener' in document) {
      document.addEventListener('DOMContentLoaded', function() {
          FastClick.attach(document.body);
      }, false);
  }
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

app.config(function($stateProvider, $urlRouterProvider, $locationProvider,
  appBase) {
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
      templateUrl: 'views/web.app.signup.html'
    }).state('web.app.logout', {
      url: 'logout',
      controller: 'LogoutCtrl',
      template: " "
    }).state('web.app.landing', {
      url: '',
      templateUrl: 'views/web.app.landing.html',
    }).state('web.app.forgot', {
      url: 'forgot',
      templateUrl: 'views/web.app.forgot-password.html',
    }).state('web.app.dashboard', {
      abstract: true,
      url: '',
      templateUrl: 'views/web.app.dashboard.html',
    }).state('web.app.dashboard.home', {
      url: 'home',
      templateUrl: 'views/web.app.dashboard.home.html'
    }).state('web.app.dashboard.messages', {
      url: 'messages',
      templateUrl: 'views/web.app.dashboard.messages.html'
    }).state('web.app.dashboard.post', {
      url: 'post/:hash_id',
      templateUrl: 'views/web.app.dashboard.post.html'
    }).state('web.app.dashboard.posts', {
      url: 'posts?cat',
      templateUrl: 'views/web.app.dashboard.home.html'
    }).state('web.app.dashboard.user', {
      url: 'user/:id',
      resolve: {
        profile: function($stateParams, Restangular) {
          return Restangular.one('users', $stateParams.id).get();
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

  if ( cordova ) {

  } else {
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
  }

});
