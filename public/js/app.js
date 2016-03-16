// "use strict";
var app = angular.module('testify', [
  'ngMaterial',
  'chieffancypants.loadingBar',
  'ngAnimate',
  'ngMessages',
  'angularMoment',
  'ui.router',
  'ngStorage',
  'restangular',
  'ngFacebook',
  'ngFileUpload',
  'ngImgCrop',
  'ngTextTruncate',
  'ngSanitize',
  'ngCordova'
]);

if ( document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1 ) {
  app.constant('apiBase', "https://testify-staging.herokuapp.com/api/v1");
  app.constant('appBase', "/");
  app.constant('appUrl', "https://testify-staging.herokuapp.com");
} else {
  app.constant('appUrl', "https://testify-staging.herokuapp.com");
  app.constant('appBase', "/");
  app.constant('apiBase', "api/v1");
}

app.config(['$compileProvider', '$logProvider', '$animateProvider', function ($compileProvider, $logProvider, $animateProvider) {
  $logProvider.debugEnabled(false);
  $compileProvider.debugInfoEnabled(false);
  //$animateProvider.classNameFilter( /\banimated\b/ );
}]);

app.config(function( $httpProvider, RestangularProvider, $facebookProvider,
  apiBase) {
  $facebookProvider.setAppId(180042792329807);
  RestangularProvider.setBaseUrl(apiBase);
  RestangularProvider.setFullResponse(true);

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

app.run(function($cordovaSplashscreen, $cordovaKeyboard, $cordovaStatusbar) {
  window.addEventListener('load', function() {
    new FastClick(document.body);
  }, false);

  // Load the facebook SDK asynchronously
  (function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

  if(document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1){
    document.addEventListener("deviceready", function () {
      $cordovaStatusbar.style(1);
      $cordovaStatusbar.styleHex('#819CAD');
      $cordovaKeyboard.hideAccessoryBar(true);
      $cordovaSplashscreen.hide();

    }, false);
  }

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
    }).state('web.app.dashboard.centered', {
      abstract: true,
      url: '',
      templateUrl: 'views/web.app.dashboard.centered.html',
    }).state('web.app.dashboard.centered.home', {
      url: 'home',
      templateUrl: 'views/web.app.dashboard.centered.home.html'
    }).state('web.app.dashboard.centered.notifications', {
      url: 'notifications',
      templateUrl: 'views/web.app.dashboard.notifications.html'
    }).state('web.app.dashboard.messages', {
      url: 'messages',
      templateUrl: 'views/web.app.dashboard.messages.html'
    }).state('web.app.dashboard.message', {
      url: 'messages/:user_id',
      templateUrl: 'views/web.app.dashboard.message.html',
      controller: 'MessageCtrl',
      resolve: {
        messagingUser: function(Restangular, $stateParams, $q){
          var d = $q.defer();
          Restangular.one('users', $stateParams.user_id).get().then(
            function(r) {
              d.resolve(r.data);
            });
          return d.promise;
        }
      }
    }).state('web.app.dashboard.post', {
      url: 'posts/:hash_id',
      templateUrl: 'views/web.app.dashboard.post.html'
    }).state('web.app.dashboard.centered.posts', {
      url: 'posts?cat',
      templateUrl: 'views/web.app.dashboard.centered.home.html'
    }).state('web.app.dashboard.centered.user', {
      url: 'user/:id',
      resolve: {
        profile: function($stateParams, Restangular) {
          return Restangular.one('users', $stateParams.id).get();
        }
      },
      views: {
        '': {
          templateUrl: "views/web.app.dashboard.centered.profile.html",
          controller: 'ProfileCtrl',
        },
        '@web.app.dashboard.centered.user': {
          templateUrl: 'views/web.app.dashboard.profile.activities.html',
        }
      }
    }).state('web.app.dashboard.centered.user.activities', {
      url: '/activities',
      templateUrl: 'views/web.app.dashboard.profile.activities.html',
    }).state('web.app.dashboard.centered.user.favorites', {
      url: '/favorites',
      templateUrl: 'views/web.app.dashboard.profile.favorites.html',
    }).state('web.app.dashboard.centered.user.taps', {
      url: '/taps',
      templateUrl: 'views/web.app.dashboard.profile.taps.html',
    }).state('web.app.dashboard.centered.user.edit', {
      url: '/edit',
      views: {
        '@web.app.dashboard': {
          templateUrl: 'views/web.app.dashboard.profile.edit.html'

        }
      }
    });

  $urlRouterProvider.otherwise(appBase + "home");

  if ( document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1 ) {

  } else {
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
  }

});

app.config(function($mdThemingProvider) {
  var primaryPalette = $mdThemingProvider.extendPalette('blue', {
    'contrastDefaultColor': 'light',
    'contrastDarkColors': ['300'],
    'contrastLightColors': ['100', '500'],
    '500': '6AA3C8',
    '50': '1C3456',
    '100': '5DADE0',
    '300': 'FAFAFA',
    '400': 'F4F4F4'
  });
  var accentPalette = $mdThemingProvider.extendPalette('green', {

    'contrastDefaultColor': 'light',
    'contrastDarkColors': ['200', '300'],
    'contrastLightColors': ['500'],
    '500': '97B6CA',
    '50': '1C3456',
    '100': '5DADE0',
    '200': 'e74c3c',
    '300': 'FFFFFF',
    '400': 'F4F4F4',
    '600': '27ae60',
    '700': '77777E'
  });

  $mdThemingProvider.definePalette('primary', primaryPalette);
  $mdThemingProvider.definePalette('accent', accentPalette);
  //console.log($mdThemingProvider.theme('default'));
  $mdThemingProvider.theme('default')
    .primaryPalette('primary', {
      'default': '500',
      'hue-1': '50',
      'hue-2': '100',
      'hue-3': '300'
    })
    .accentPalette('accent', {
      'default': '200',
      'hue-1': '600',
      'hue-2': '700'
    })
    .warnPalette('red');

});
