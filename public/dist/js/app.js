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

app.config(["$mdThemingProvider", function($mdThemingProvider) {
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

}]);

app.config(['$compileProvider', '$logProvider', '$animateProvider', function ($compileProvider, $logProvider, $animateProvider) {
  $logProvider.debugEnabled(false);
  $compileProvider.debugInfoEnabled(false);
  //$animateProvider.classNameFilter( /\banimated\b/ );
}]);

app.config(["$httpProvider", "RestangularProvider", "$facebookProvider", "apiBase", function( $httpProvider, RestangularProvider, $facebookProvider,
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
}]);

app.run(["$cordovaSplashscreen", "$cordovaKeyboard", "$cordovaStatusbar", function($cordovaSplashscreen, $cordovaKeyboard, $cordovaStatusbar) {
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

}]);

app.config(["$stateProvider", "$urlRouterProvider", "$locationProvider", "appBase", function($stateProvider, $urlRouterProvider, $locationProvider,
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
        messagingUser: ["Restangular", "$stateParams", "$q", function(Restangular, $stateParams, $q){
          var d = $q.defer();
          Restangular.one('users', $stateParams.user_id).get().then(
            function(r) {
              d.resolve(r.data);
            });
          return d.promise;
        }]
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
        profile: ["$stateParams", "Restangular", function($stateParams, Restangular) {
          return Restangular.one('users', $stateParams.id).get();
        }]
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

}]);

app.controller('AppCtrl', ["$rootScope", "$scope", "$mdSidenav", "$mdMedia", "$location", "$state", "$q", "AppService", "Auth", "Me", "appBase", "$filter", "Pusher", "$stateParams", "NotificationsService", "TokenService", "$timeout", function($rootScope, $scope, $mdSidenav, $mdMedia,
  $location, $state, $q, AppService, Auth, Me, appBase, $filter, Pusher, $stateParams, NotificationsService, TokenService, $timeout) {
  $scope.location = $location;
  $scope.user = Auth.userProfile;
  $scope.composingPost = false;
  $scope.tokHashId = TokenService.token().hash_id;
  //$state.go('web.app.login');

  $scope.ui = {
    showSearch: false,
    showSideNav: $state,
    toggleNav: function (which) {
      if(which === 'left'){
        $mdSidenav(which).toggle();
        $mdSidenav('right').close();
      }else{
        $mdSidenav(which).toggle();
        $mdSidenav('left').close();
      }
      //console.log(which);
    },
    toggleSearchBox: function() {
      $scope.ui.showSearch = !$scope.ui.showSearch;
    }
  };
  //console.log($state);
  //$scope.ui.showSideNav = $state.current.data.showSideNav;
  //console.log($scope.tokHashId);


  AppService.getCategoriesWithCount().then(function(cats) {
    var l = cats.data.length;
    for(var i = 0; i < l; i++){
      cats.data[i].count = $filter('socialCounter')(cats.data[i].count);
    }
    $scope.categories = cats.data;
  });


  var originatorEv;
  $scope.openMenu = function($mdOpenMenu, ev) {
    originatorEv = ev;
    $mdOpenMenu(ev);
    //console.log(ev)
  };

  $scope.logout = function() {
    Auth.logout();
    //Me.callInit();
    //console.log($scope.user);
  };

  $scope.redirect = function(state) {
    $state.go(state);
  };

  $scope.menu = [{
    link: '',
    state: 'web.app.dashboard.centered.home',
    title: 'Feeds',
    icon: 'home',
    condition: true,
    click: ''
  }];

  $scope.menuAuth = [{
    link: 'profile',
    state: "web.app.dashboard.centered.user({id: user.username || user.hash_id})",
    title: 'Profile',
    icon: 'account',
    condition: 'user.authenticated',
    action: null
  }, {
    link: '',
    state: 'web.app.dashboard.messages',
    title: 'Messages',
    icon: 'message-text-outline',
    condition: 'user.authenticated',
    click: ''
  }, {
    link: '',
    state: "web.app.dashboard.centered.user.favorites({id: user.username || user.hash_id})",
    title: 'Favourites',
    icon: 'star',
    condition: 'user.authenticated',
    action: null
  }, {
    link: '',
    state: "web.app.dashboard.centered.user.edit({id: user.username || user.hash_id})",
    title: 'Preferences',
    icon: 'settings',
    condition: 'user.authenticated',
    action: null
  }];

  $scope.getSearchResultIcon = function(type) {
    //console.log(icon[type]);
    return icon[type];
  };

  $scope.searchIcons = {
    "tag": "pound",
    "user": "at"
  };

  $scope.searchRepo = function(query) {
    var d = $q.defer();
    AppService.search.getList({
      q: query
    }).then(function(response) {
      d.resolve(response.data.plain());
      //console.log(response.data.plain());
      //return result;
    }, function() {
      d.reject();
    });

    return d.promise;
  };

  $scope.app = {
    notifications: {
      messages: NotificationsService.MessageNotifications,
      friend_requests: NotificationsService.FriendRequestNotifications,
      general: NotificationsService.Notifications
    },
    messages: {
      notifications: NotificationsService.MessageNotifications
    }
  };



}]);

app.controller('LandingCtrl', ['Auth', '$state', function(Auth, $state) {
    Auth.refreshProfile().then(function() {
        if (Auth.userProfile.authenticated === true) {
            $state.go('web.app.dashboard.centered.home');
        }
    });


}]);

app.controller('PostsCtrl',
    ["AppService", "PostService", "Me", "$scope", "$state", "$stateParams", "Restangular", "UXService", "$document", function(AppService, PostService, Me, $scope, $state, $stateParams, Restangular,
        UXService, $document) {

        $scope.posts = PostService.stream;

        if ($state.current.name == "web.app.dashboard.post") {
            $scope.home.status = 1;

            Restangular.one('posts', $stateParams.hash_id).get().then(
                function(r) {
                    $scope.home.posts = [r.data];
                    $scope.home.status = 0;
                }
            );
        }

        if ($state.current.name == "web.app.dashboard.centered.posts") {
            PostService.loadCategorized($stateParams.cat);

            $scope.posts = PostService.categorized;
        }

    }]);

app.controller('LoginCtrl', ['$scope', 'UXService', 'FB', '$q', '$state',
    'Auth', 'Me', 'appBase',
    function($scope, UXService, FB, $q, $state, Auth, Me, appBase) {

        if (Auth.userProfile.authenticated === true) {
            $state.go('web.app.dashboard.centered.home');
        }

        $scope.fb_button = "Login with Facebook";

        FB.getLoginStatus(function(r) {
            //console.log(r);
            if (r.status === 'connected') {
                //console.log(r);
                FB.api('/me', function(r) {
                    $scope.fb_logged_in = true;
                    $scope.fb_name = r.name;
                    $scope.fb_button = "Continue as " + $scope.fb_name;
                });
                //console.log(r);
            } else {
                //console.log("false;");
                $scope.fb_logged_in = false;
                $scope.fb_name = "null";
                $scope.fb_button = "Login with Facebook";
            }
        });

        $scope.loginFB = function() {
            Auth.signinFB().then(function() {
                $state.go('web.app.dashboard.centered.home');
            }, function(r) {
                UXService.toast(r.data.error);
            });
        };

        $scope.UXLoginFB = function() {
            UXService.UXLoginFB();
        };

        $scope.UXSubmitLogin = function() {
            UXService.UXSubmitLogin($scope.loginDetails);
        };

        var refresh = function() {
            FB.api("/me", {
                fields: 'id,name,email,access_token'
            }).then(
                function(response) {
                    $scope.welcomeMsg = "Welcome " + response.name;
                    console.log(response);
                    //console.log(JSON.stringify(response));
                },
                function(err) {
                    $scope.welcomeMsg = "Please log in";
                });
        };

        $scope.submitLogin = function() {
            Auth.signin($scope.loginDetails).then(function(r) {
                //console.log($scope.user);
                $state.go('web.app.dashboard.centered.home');
                //Me.callInit();
                //Success Login
            }, function(err) {
                UXService.toast('Wrong username or password');
            });
        };

    }
]);

app.controller('SignupCtrl', ['$scope', 'FB', 'Auth', '$location',
    '$mdDialog', '$state',
    function($scope, FB, Auth, $location, $mdDialog, $state) {
        var refresh;

        $scope.newUser = {};
        $scope.signupFb = function() {
            FB.login().then(function() {
                refresh();
            });
        };

        refresh = function() {
            FB.api("/me", {
                fields: 'id,first_name,last_name,email'
            }).then(
                function(response) {
                    FB.logout();
                    //$scope.welcomeMsg = "Welcome " + response.name;
                    //console.log(response);
                    //console.log(JSON.stringify(response));
                    //Auth.BuildSession(name, id, lastname for appctrl scope);
                    //$location.path('/');
                },
                function(err) {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.querySelector('body')))
                        .clickOutsideToClose(true)
                        .title('Login failed!')
                        //.content('Login failed')
                        .ariaLabel('Failed login')
                        .ok('close')
                        //.targetEvent(ev)
                    );

                    //$scope.welcomeMsg = "Please log in";
                });
        };

        $scope.submitForm = function() {
            //console.log($scope.newUser);
            //console.log($scope.signupForm.$valid);
            if ($scope.signupForm.$valid) {
                Auth.signup($scope.newUser).then(
                    function(r) {

                        $state.go('web.app.dashboard.centered.home');
                        //console.log(r);
                    },
                    function(r) {
                        //console.log(r);
                    });
            }
        };

    }
]);

app.controller('LogoutCtrl', ['$scope', 'Auth', 'Me', function($scope, Auth, Me) {
    Auth.logout();
    //$scope.logout();
    console.log("mayama");
}]);

app.controller('ProfileCtrl', ['Restangular', '$scope', '$stateParams',
    '$state', 'Auth',
    function(Restangular, $scope, $stateParams, $state, Auth) {
        //console.log(profile);
        $scope.me = Auth.userProfile;
        var user_profile = Restangular.one('users', $stateParams.id);

        $scope.user = {
            profile: {},
            activities: {
                posts: [],
                loading: true
            },
            favorites: {
                posts: [],
                loading: true
            },
            taps: {
                posts: [],
                loading: true
            }
        };

        $scope.loadUserProfile = function() {
            Restangular.one('users', $stateParams.id).get({
                profile: true
            }).then(function(r) {
                $scope.user_profile = r.data;
            });
        };

        $scope.loadUserActivities = function() {
            $scope.user.activities.loading = true;
            user_profile.all('activities').getList().then(function(r) {
                $scope.user.activities.posts = r.data;
                $scope.user.activities.loading = false;
            });
        };

        $scope.loadUserFavorites = function() {
            $scope.user.favorites.loading = true;

            user_profile.all('favorites').getList().then(function(r) {
                $scope.user.favorites.posts = r.data;
                $scope.user.favorites.loading = false;

            });
        };

        $scope.loadUserTaps = function() {
            $scope.user.taps.loading = true;

            user_profile.all('taps').getList().then(function(r) {
                $scope.user.taps.posts = r.data;
                $scope.user.taps.loading = false;

            });
        };

        $scope.sendFriendRequest = function(id) {
            Restangular.one('me').all('friends').post({
                user_id: id
            });

        };

        var load = function() {
            $scope.loadUserProfile();

            switch ($state.current.name) {
                case 'web.app.dashboard.user.favorites':
                    $scope.loadUserFavorites();
                    break;
                case 'web.app.dashboard.user.taps':
                    $scope.loadUserTaps();
                    break;
                case 'web.app.dashboard.user.activities':
                    $scope.loadUserActivities();
                    break;
                default:
                    $scope.loadUserActivities();
            }

        };

        load();

    }
]);

app.controller('ProfileEditCtrl', ['Restangular', '$scope', '$stateParams',
    '$state', 'Upload', 'Auth', 'UXService', 'apiBase',
    function(Restangular, $scope, $stateParams, $state, Upload, Auth,
        UXService, apiBase) {
        //console.log(profile);
        Restangular.one('me').get({
            'profile': true
        }).then(
            function(r) {
                $scope.user_profile = r.data;
            }
        );
        $scope.user = Auth.userProfile;

        if (!(Auth.userProfile.hash_id == $stateParams.id || Auth.userProfile.username ==
                $stateParams.id)) {
            console.log($stateParams);
            $state.go('web.app.dashboard.centered.home');
        }

        $scope.saveAccountInfo = function(obj) {
            Restangular.one('me').post(
                'profile', obj).then(function(r) {
                Auth.userProfile.first_name = obj.first_name;
                Auth.userProfile.last_name = obj.last_name;
                Auth.userProfile.username = obj.username;

                $scope.section_account = false;
            });

        };

        $scope.saveAboutInfo = function(obj) {
            Restangular.one('me').post(
                'profile', obj);
            Auth.userProfile.location = obj.location;
            if (Auth.userProfile.profile === null) {
                Auth.userProfile.profile = {};
            }
            Auth.userProfile.profile.favorite_book = obj.favorite_book;
            Auth.userProfile.profile.favorite_verse = obj.favorite_verse;
            Auth.userProfile.profile.favorite_parable = obj.favorite_parable;
            Auth.userProfile.profile.denomination = obj.denomination;

            $scope.section_about_me = false;
        };

        $scope.uploadAvatar = function(file) {
            $scope.uploading = true;

            Upload.upload({
                url: apiBase + '/me/profile/avatar',
                data: {
                    file: Upload.dataUrltoBlob(file)
                }
            }).then(function(r) {
                Auth.userProfile.avatar = r.data.url;
                UXService.toast('Successfully updated your display picture');

            }, function() {
                //console.log(file);
                UXService.toast('Changing display picture wasn\'t successful');
            }).finally(function() {
                $scope.uploading = false;
                $scope.picFile = '';
            });
        };

        $scope.upload = function(dataUrl) {
            console.log(9);
            Upload.upload({
                url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
                data: {
                    file: Upload.dataUrltoBlob(dataUrl)
                },
            }).then(function(response) {
                $timeout(function() {
                    $scope.result = response.data;
                });
            }, function(response) {
                if (response.status > 0) $scope.errorMsg = response.status +
                    ': ' + response.data;
            }, function(evt) {
                $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
            });
        };

        $scope.changePassword = function() {
            if ($scope.password.newPassword &&
                $scope.password.newPassword1 && $scope.password.newPassword === $scope.password.newPassword1) {
                Restangular.one('me').post('password',
                    $scope.password).then(function(resp) {
                    if (resp.status == 202) {
                        UXService.toast('Successfully changed password');
                    }
                }, function(resp) {
                    UXService.toast('Something\'s wrong');
                });
            } else {
                UXService.toast('Please repeat the password');
            }
        };

    }
]);

app.controller('MessagesCtrl', ["$scope", "$state", "$stateParams", "Restangular", "Auth", "Pusher", "MessageService", function($scope, $state, $stateParams, Restangular, Auth, Pusher, MessageService) {

    $scope.chats = MessageService.messages;

}]);

app.controller('MessageCtrl', ['$scope', '$rootScope', 'messagingUser', 'Restangular', 'Auth', '$stateParams', '$state', 'Pusher', 'NotificationsService', 'UtilityService', function($scope, $rootScope, messagingUser, Restangular, Auth, $stateParams, $state, Pusher, NotificationsService, UtilityService) {
    $scope.messages = [];
    $scope.inputMessage = '';
    $scope.messagingUser = messagingUser;
    var chat_channel = "";
    var chat_id = null; //will be set after call to server in restangular promise

    if (!$stateParams.user_id) {
        $state.go('web.app.dashboard.centered.home');
    }

    var push_new_message = function(message) {
        $scope.messages.push(message);

        if (!$scope.$$phase) {
            $scope.$digest();
        }

        $("#messages-container").animate({
            scrollTop: $("#messages-container")[0].scrollHeight + 500
        }, 500);

        NotificationsService.clearNotifications(chat_id); //TO-DO::: MAKE THIS A SERVER CALL TO CLEAR NOTIFICATION ON SERVER SIDE
    };

    var subscription_succeeded = function(message) {
        //$scope.messages.push(message);
        smartLoad($scope.messages);
    };

    var smartLoad = function(messages) {
        var id = UtilityService.findHighestID(messages);
        //console.log(id);

        Restangular.all('me').all('messages').one($stateParams.user_id).get({
            after: id
        }).then(
            function(r) {
                //console.log($stateParams.user_id);
                var count = r.data.length;
                if (count) {
                    for (var i = 0; i < count; i++) {
                        $scope.messages.push(r.data[i]);
                    }
                    NotificationsService.clearNotifications(chat_id);
                }

                $("#messages-container").animate({
                    scrollTop: $("#messages-container")[0].scrollHeight + 500
                }, 1);

            },
            function(r) {

            });

    };

    Restangular.all('me').all('messages').one($stateParams.user_id).getList().then(
        function(r) {
            //console.log(r.headers('X-CHAT-ID'));
            chat_id = r.headers('X-CHAT-ID');
            chatChannel = 'private-message-' + chat_id;
            $scope.messages = r.data;
            if (r.length) {
                NotificationsService.clearNotifications(chat_id);
            }
            var pm = Pusher.pusher.subscribe(chatChannel);

            pm.bind('new_message', push_new_message);
            pm.bind('pusher:subscription_succeeded', subscription_succeeded);

            $("#messages-container").animate({
                scrollTop: $("#messages-container")[0].scrollHeight + 500
            }, 1);

        },
        function(r) {

        });

    $scope.sendMessage = function() {
        if ($scope.inputMessage.trim()) {
            Restangular.all('users').one($stateParams.user_id).all('messages').post({
                message: $scope.inputMessage,
                socket_id: Pusher.pusher.connection.socket_id
            }).then(function(r) {
                $scope.messages.push(r.data);
                $scope.inputMessage = '';
                $("#messages-container").animate({
                    scrollTop: $("#messages-container")[0].scrollHeight + 500
                }, 1);
            }, function(r) {

            });
        } else {
            //Do nothing!!!;
        }

    };

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        Pusher.pusher.unsubscribe(chatChannel);
    });



}]);

app.controller('TComposerCtrl',
    ["$scope", "UXService", "Pusher", "AppService", "PostService", "$mdToast", "Me", "Upload", "apiBase", "$timeout", "$document", "EmojioneService", "$q", function($scope, UXService, Pusher, AppService, PostService, $mdToast, Me, Upload,
        apiBase, $timeout, $document, EmojioneService, $q) {
        $scope.selectedCategories = [];
        $scope.files = [];
        $scope.newPost = {
            creating: false
        };

        $timeout(function() {
            emojionearea = $('#tComposerInput').emojioneArea({
                template: "<editor/><filters/><tabs/>",
                autoHideFilters: true,
                useSprite: true,
                placeholder: "Share your testimony...",
                container: null,
                hideSource: true,
                emojioneVersion: "2.1.1"

            });
            $scope.emojionearea = emojionearea[0].emojioneArea;
            //console.log($scope.emojionearea);
        }, 1);

        $timeout(function() {
            angular.element(document.querySelector('.emojionearea-editor')).on(
                'focus',
                function() {
                    $scope.composingPost = true;
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                });
        }, 1050);

        AppService.getCategories().then(function(cats) {
            $scope.categories = cats.data;

            var length = $scope.categories.length;

            for (var i = 0; i < length; i++) {
                if ($scope.categories[i].name == 'General') {
                    $scope.selectedCategories.push($scope.categories[i]);
                    break;
                }
            }
        });

        $scope.toggleCatPopup = function() {

            $scope.showSelectCatPopup = !$scope.showSelectCatPopup;
        };

        $scope.catsClick = function(category) {
            var idx = $scope.selectedCategories.indexOf(category);
            if (idx > -1) $scope.selectedCategories.splice(idx, 1);
            else $scope.selectedCategories.push(category);
        };

        $scope.catsExists = function(category) {
            if (category.name == 'General' && $scope.categories.length === 0) {
                return true;
            } else {
                return $scope.selectedCategories.indexOf(category) > -1;

            }
        };

        var isUploadFinished = function() {
            finished = true;

            angular.forEach($scope.files, function(file, key) {
                if (file.complete !== true) {
                    finished = false;
                }

            });
            return finished;
        };

        $scope.removePicture = function(i) {

            $scope.files.splice(i, 1);
        };

        var uploadImages = function(files) {
            var d = $q.defer();
            var finished = [];

            $scope.files = files;

            var doUpload = function(file) {
                file.file = file;
                file.upload = Upload.upload({
                    url: apiBase + '/images',
                    data: {
                        file: file
                    }
                });

                file.upload.then(function(response) {
                    file.complete = true;
                    file.result = response.data;
                    //console.log(response);
                    finished.push(response.data.image_id);

                    if (files.length == finished.length) {
                        d.resolve(finished);
                    }
                }, function(response) {
                    file.failed = true;
                    if (files.length == finished.length) {
                        d.resolve(finished);
                    }
                }, function(evt) {
                    file.progress = Math.min(100, parseInt(100.0 *
                        evt.loaded / evt.total));
                });
            };

            if (files && files.length) {
                angular.forEach(files, function(file) {
                    doUpload(file);
                });


            }
            return d.promise;

        };

        $scope.composePost = function(ev) {
            //post = "";
            //console.log($scope);
            //post = EmojioneService.emojione.toShort($scope.post);
            post = EmojioneService.emojione.toShort($scope.emojionearea.getText());
            anonymous = $scope.anonymous;

            if (!post) {
                post = " ";
            }

            if (typeof anonymous === "undefined") {

                anonymous = 0;
            } else if (anonymous.$viewValue === false || anonymous === false) {

                anonymous = 0;
            } else {

                anonymous = 1;
            }

            var createPost = function(o) {
                //console.log(Me.sendPost);
                $scope.newPost.creating = true;

                var cats = [];
                var count = $scope.selectedCategories.length;
                for (var i = 0; i < count; i++) {
                    cats.push($scope.selectedCategories[i].id);
                }


                Me.sendPost({
                    post: o.p,
                    anonymous: o.a,
                    categories: cats,
                    images: o.i,
                    socket_id: Pusher.pusher.connection.socket_id
                }).then(function(r) {
                    $scope.newPost.creating = false;

                    if (r.status === 201) {
                        PostService.stream.data.unshift(r.data);
                        //console.log(r.data);
                    }

                    $scope.emojionearea.setText("");
                    $scope.post = "";
                    $scope.composingPost = false;
                    $scope.files = [];
                }, function(r) {
                    $scope.newPost.creating = false;
                });
            };

            if ($scope.files.length) {
                uploadImages($scope.files).then(
                    function(id_arr) {
                        //console.log(id_arr);
                        createPost({
                            p: post.trim(),
                            a: anonymous,
                            i: id_arr
                        });
                    });
            } else {
                if (post.trim()) {
                    createPost({
                        p: post.trim(),
                        a: anonymous,
                        i: []
                    });
                } else {
                    UXService.toast("Your post has no content!");
                }

            }
        };
}]);

app.controller('NotificationsController', ["$scope", "Restangular", "NotificationsService", "FriendshipService", function($scope, Restangular, NotificationsService, FriendshipService) {
    var types = {
        'App\\Post': 'created a post',
        'App\\Tap': 'tapped on a post',
        'App\\Amen': 'said amen to a post',
        'App\\Favorite': 'favorited a post',
        'App\\Comment': 'commented on a post',
    };

    Restangular.one('me').all('friend_requests').getList().then(function(r) {
        $scope.friend_requests = r.data;
    });
    Restangular.one('me').all('notifications').getList({
        "profiles": true
    }).then(function(r) {
        //$scope.notifications = r.data;
        $scope.notifications = [];

        notifs = r.data;

        for (var i = 0; i < notifs.length; i++) {
            aNotif = {
                content: types[notifs[i].action_type],
                user: notifs[i].user
            };

            $scope.notifications.push(aNotif);
        }


    });

    $scope.acceptRequest = FriendshipService.acceptRequest;
    $scope.deleteRelationship = FriendshipService.deleteRelationship;

}]);

app.controller('UXModalLoginCtrl', ['$scope', '$mdDialog', function($scope,
    $mdDialog) {
    $scope.hide = function() {
        $mdDialog.hide();
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.answer = function(answer) {
        $mdDialog.hide(answer);
    };
}]);

app.controller('UXModalPostCategorizeCtrl', ['$scope', '$mdDialog',
    'AppService', 'selectedCategories',
    function($scope, $mdDialog, AppService, selectedCategories) {

        AppService.getCategories().then(function(res) {
            $scope.categories = res.data;
            console.log($scope.actives);
        });
        $scope.hide = function() {
            $mdDialog.hide();
        };
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.filePostIn = function(id) {
            console.log($scope.selectedCategories);

            $mdDialog.hide(id);
        };
    }
]);

app.directive('leftSidenav', [function() {

    return {
        restrict: 'A',
        transclude: true,
        replace: true,
        templateUrl: 'partials/app/left-sidenav.html'
    };
}]);

app.directive('rightSidenav', [function() {
    return {
        restrict: 'A',
        transclude: true,
        replace: true,
        templateUrl: 'partials/app/right-sidenav.html'
    };
}]);

app.directive('searchbox', [function() {
    return {
        restrict: 'A',
        transclude: true,
        replace: true,
        templateUrl: 'partials/app/searchbox.html'
    };
}]);

app.directive('appToolbar', [function() {
    return {
        restrict: 'A',
        transclude: true,
        replace: true,
        templateUrl: 'partials/app/app-toolbar.html'
    };
}]);

app.directive('appToolbarNoLogin', [function() {
    return {
        restrict: 'A',
        transclude: true,
        replace: true,
        templateUrl: 'partials/app/app-toolbar-no-login.html'
    };
}]);

app.directive('testifyPosts', ['Restangular', function(Restangular) {
    return {
        restrict: 'A',
        transclude: true,
        replace: true,
        templateUrl: 'partials/templates/Post/posts.html',
        scope: {
            posts: '=testifyPosts',
            status: '=status'
        },
        controller: ["$scope", function($scope) {
            this.SDeletePost = function(post_id) {
                Restangular.one('posts', post_id).remove().then(function(r) {
                    var i = $scope.posts.map(function(x) {
                            return x.id;
                        })
                        .indexOf(post_id);
                    $scope.posts.splice(i, 1);
                });
            };
            $scope.noPosts = false;
        }]
    };
}]);

app.directive('testifyPost', ["Restangular", "CommentService", "Auth", "UXService", "FB", "$cordovaFacebook", "appUrl", "$filter", "EmojioneService", "isCordova", function(Restangular, CommentService, Auth, UXService, FB, $cordovaFacebook, appUrl, $filter, EmojioneService, isCordova) {
    return {
        restrict: 'A',
        require: "^?testifyPosts",
        scope: {
            post: '=testifyPost'
        },
        templateUrl: 'partials/templates/Post/post.html',
        link: function(scope, element, attrs, SuperTPostsCtrl) {
            scope.user = Auth.userProfile;
            scope.CommentsUI = {
                loading: false,
                retryButton: false
            };

            var actions = {
                'App\\Tap': ['tapped into', 'this post'],
                'App\\Favorite': ['favorited', 'this post'],
                'App\\Amen': ['said amen', 'to this post'],
                'App\\Comment': ['commented', 'on this post'],
                'App\\Post': ['posted', 'on his wall'],
            };

            if (scope.post.user_ref_activities) {
                if (scope.post.user_ref_activities.length > 0) {
                    interpretation = '';
                    i = 0;
                    var action;
                    var ref_activities = scope.post.user_ref_activities;
                    l = scope.post.user_ref_activities.length;

                    if (l == 1) {
                        a_t = ref_activities[0].action_type;
                        interpretation += ' ' +
                            actions[a_t][0] +
                            ' ' + actions[a_t][1];
                    } else if (l == 2) {

                        for (action in ref_activities) {
                            i++;
                            a_t = ref_activities[action].action_type;

                            if (i == l - 1) {
                                interpretation += ' ' + actions[a_t][0];
                            }

                            if (i == l) {
                                interpretation += ' and ' + actions[a_t][0] + ' ' + actions[a_t][1];
                            }
                        }
                    } else if (l > 2) {
                        for (action in ref_activities) {
                            i++;
                            a_t = ref_activities[action].action_type;
                            if (i == l - (l - 1)) {
                                interpretation += ' ' + actions[a_t][0];
                            } else if (i <= l - 1) {
                                interpretation += ', ' + actions[a_t][0];
                            } else if (l >= i) {
                                interpretation += ' and ' + actions[a_t][0] + ' ' + actions[a_t][1];
                            }
                        }
                    }

                    scope.interpretation = interpretation;
                }

            }

            scope.showMore = false;
            var less, more;
            var postWordsCount = scope.post.text.split(' ').length;
            more = EmojioneService.emojione.shortnameToImage(scope.post.text);
            if(postWordsCount > 60){
              var all_array = scope.post.text.split(' ');
              less = all_array.slice(0, 59).join(' ') + '&hellip;';
              less = EmojioneService.emojione.shortnameToImage(less);
              scope.optimizedText = less;
              scope.post_truncate = true;
            }else{
              scope.optimizedText = more;
            }

            scope.toggleMore = function () {
              if(scope.showMore){
                scope.optimizedText = less;
              }else{
                scope.optimizedText = more;
              }
              scope.showMore = !scope.showMore;
            };


            var originatorEv;
            scope.openMenu = function($mdOpenMenu, ev) {
                originatorEv = ev;
                $mdOpenMenu(ev);
            };

            if(scope.post.prayer){
              scope.amens_count = $filter('socialCounter')(scope.post.amens_count);
            }
            scope.taps_count = $filter('socialCounter')(scope.post.taps_count);
            scope.comments_count = $filter('socialCounter')(scope.post.comments_count);

            scope.showCommentBox = false;
            scope.openCommentBox = function() {
                //console.log(scope.post.post_id);
                scope.CommentsUI.loading = true;
                scope.CommentsUI.retryButton = false;
                Restangular.one('posts', scope.post.id).getList('comments').then(function(r) {
                    //console.log(r);
                    scope.post.comments = r.data;
                    scope.CommentsUI.loading = false;
                }, function(r) {
                    scope.CommentsUI.retryButton = true;
                    scope.CommentsUI.loading = false;
                });

                scope.showCommentBox = true;
            };

            scope.addComment = function(ev) {
                var doCommentPost = function() {
                    //console.log(Date());
                    if (scope.commentBox) {
                        Restangular.one('posts', scope.post.id).post('comments', {
                            text: scope.commentBox
                        }).then(function(r) {
                            scope.post.comments_count++;
                            scope.comments_count = $filter('socialCounter')(scope.post.comments_count);
                            scope.post.comments.unshift(r.data);
                            scope.commentBox = "";
                        }, function(r){
                            UXService.toast('Sorry, couldn\'t post your comment check your network and try again ');
                        });
                    }
                };
                if (Auth.userProfile.authenticated) {
                    doCommentPost();
                } else {
                    UXService.signinModal(ev).then(function() {
                        doCommentPost();
                    }, function() {
                        UXService.toast('Sorry, we couldn\'t sign you check your network and try again');
                    });
                }
            };

            scope.deleteComment = function(comment_id) {
                var comment = CommentService.comment(comment_id);
                comment.remove().then(function(r) {
                    //console.log(r);
                    var i = scope.post.comments.map(function(x) {
                            return x.id;
                        })
                        .indexOf(comment_id);
                    //console.log($scope);
                    //array.splice(removeIndex, 1);
                    scope.post.comments.splice(i, 1);
                    scope.post.comments_count--;
                    scope.comments_count = $filter('socialCounter')(scope.post.comments_count);

                    //scope.post = "";

                });
            };

            scope.toggleFavorite = function(ev) {
                //console.log(scope.post.post_id)
                var doFavorite = function() {
                    if (scope.post.favorited) {
                        scope.post.favorited = false;
                        scope.post.favorites_count--;
                        Restangular.one('posts', scope.post.id).one('favorites').remove().then(function(r) {
                            //console.log(r);
                            scope.post.favorited = r.data.status;
                            scope.post.favorites_count = r.data.count;
                        });
                    } else {
                        scope.post.favorited = true;
                        scope.post.favorites_count++;
                        Restangular.one('posts', scope.post.id).one('favorites').post().then(function(r) {
                            //console.log("created");
                            scope.post.favorited = r.data.status;
                            scope.post.favorites_count = r.data.count;
                        });
                    }
                };
                if (Auth.userProfile.authenticated) {
                    doFavorite();
                } else {
                    UXService.signinModal(ev).then(function() {
                        doFavorite();
                    });

                }
                //console.log(scope.post);
            };

            scope.toggleTap = function(ev) {
                //console.log(scope.post.post_id)
                var doTap = function() {
                    if (scope.post.tapped_into) {
                        scope.post.tapped_into = false;
                        scope.post.taps_count--;
                        Restangular.one('posts', scope.post.id).one('taps').remove().then(function(r) {
                            //console.log(r);
                            scope.post.tapped_into = r.data.status;
                            scope.post.taps_count = r.data.count;
                            scope.taps_count = $filter('socialCounter')(scope.post.taps_count);
                        });
                    } else {
                        scope.post.tapped_into = true;
                        scope.post.taps_count++;
                        Restangular.one('posts', scope.post.id).one('taps').post().then(function(r) {
                            //console.log("created");
                            scope.post.tapped_into = r.data.status;
                            scope.post.taps_count = r.data.count;
                            scope.taps_count = $filter('socialCounter')(scope.post.taps_count);
                        });
                    }
                };

                if (Auth.userProfile.authenticated) {
                    doTap();
                } else {
                    UXService.signinModal(ev).then(function() {
                        doTap();
                    });
                }
                //console.log(scope.post);
            };

            scope.sayAmen = function(ev) {
                var doSayAmen = function() {

                    if(scope.post.amen === true){
                        UXService.toast("You have already said Amen to this post");
                        return ;
                    }

                    scope.post.amen = true;
                    scope.post.amens_count++;
                    Restangular.one('posts', scope.post.id).one('amens').post().then(function(r) {
                        scope.post.amen = r.data.status;
                        scope.post.amens_count = r.data.count;
                        scope.amens_count = $filter('socialCounter')(scope.post.amens_count);
                    });

                };
                if (Auth.userProfile.authenticated) {
                    doSayAmen();
                } else {
                    UXService.signinModal(ev).then(function() {
                        doSayAmen();
                    });

                }
            };

            scope.shareToFb = function() {
              var options = {
                method: 'feed',
                link: appUrl,
                picture: appUrl + '/dist/img/testify-fb-share-pic.png',
                name: 'Testify',
                caption: 'Sharing God\'s goodness',
                description: scope.post.text + ' (Tesfify is a community for sharing your testimonies and engaging with other people\'s testimonies)'
              };
              if(isCordova){
                $cordovaFacebook.showDialog(options)
                  .then(function(success) {

                  }, function (error) {});
              }else{
                FB.ui(options, function(response) {});
              }

            };

            scope.deletePost = function() {
                //scope.post = null;
                SuperTPostsCtrl.SDeletePost(scope.post.id);

            };
        }
    };
}]);

app.directive('myIcon', ['$timeout', function($timeout) {
    return {
        restrict: 'E',
        scope: {
            icon: "@"
        },
        replace: true,
        link: function(scope, e, attrs) {
            //scope.icon = scope.icon;
        },
        template: "<i class='mdi mdi-{{::icon}}'></i>"
    };
}]);

app.directive('testifyComposer', ["$timeout", function($timeout) {
    return {
        restrict: 'A',
        templateUrl: 'partials/app/testifyComposer.html',
        link: function(scope, elem, attrs) {


        }
        //controller: 'TComposerCtrl'
    };
}]);

app.filter('socialCounter', function() {
    return function(num) {
        out = num;
        if (num) {
            if (num >= 999 && num < 999999) {
                out = Math.round(num / 100) / 10 + "K";
            } else if (num >= 999999 && num < 999999999) {
                out = Math.round(num / 100000) / 10 + "M";
            } else if (num >= 999999999) {
                out = Math.round(num / 100000000) / 10 + "B";
            }
        }
        return out;
    };
});

app.factory('isCordova', [function(){
  var cordova = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
  return cordova;
}]);

app.factory('TokenService', ["$localStorage", function($localStorage){

  function urlBase64Decode(str) {
    var output = str.replace('-', '+').replace('_', '/');
    switch (output.length % 4) {
      case 0:
        break;
      case 2:
        output += '==';
        break;
      case 3:
        output += '=';
        break;
      default:
        throw 'Illegal base64url string!';
    }
    return window.atob(output);
  }

  var getClaimsFromToken = function() {
    var token = $localStorage.token;
    var claims = {};

    //console.log(token);
    if (typeof token !== 'undefined') {
      var encoded = token.split('.')[1];
      claims = JSON.parse(urlBase64Decode(encoded));
    }

    return claims;
  };

  var rawToken = function(){
    return $localStorage.token;
  };

  return {
    token: getClaimsFromToken,
    rawToken: rawToken
  };
}]);

app.factory('AppService', ['Restangular', 'Auth', 'Me', '$q', '$timeout', function(Restangular,
  Auth, Me, $q, $timeout) {

  var app = {
    posts: []
  };

  Auth.refreshProfile().then(function(r) {
    //Me.callInit();
    //console.log("letsee");
  });
  //console.log("appService");

  var search = Restangular.service('search');

  var getPosts = Restangular.all('posts');

  var getCategories = function(){
    var d = $q.defer();

    (function makeCall(){
      Restangular.all('categories').getList().then(function(r){
        d.resolve(r);
      }, function(){
        $timeout(function () {
          makeCall();
        }, 10000);
      });
    })();

    return d.promise;
  };

  var getCategoriesWithCount = function(){
    var d = $q.defer();

    (function makeCall(){
      Restangular.all('categories').getList({count: true}).then(function(r){
        d.resolve(r);
      }, function(){
        $timeout(function () {
          makeCall();
        }, 10000);
      });
    })();

    return d.promise;
  };


  return {
    app: app,
    search: search,
    getPosts: getPosts,
    getCategories: getCategories,
    getCategoriesWithCount: getCategoriesWithCount

  };
}]);

app.factory('Pusher', ['TokenService', 'isCordova', 'apiBase', function(TokenService, isCordova, apiBase){

  Pusher.log = function(message) {
    if (window.console && window.console.log) {
      window.console.log(message);
    }
  };

  var pusher = new Pusher('b5fa9d11972af2e0b8d1', {
    encrypted: true,
    authEndpoint: apiBase + '/pusher/auth',
    auth: {
      headers: {
        'Authorization': 'Bearer ' + TokenService.rawToken()
      }
    }
  });

  var headerAuthBearerRefresh = function () {
    pusher.config.auth.headers.Authorization = 'Bearer ' + TokenService.rawToken();
  };

  return {
    pusher: pusher,
    headerAuthBearerRefresh: headerAuthBearerRefresh
  };
}]);

app.factory('FB', ["isCordova", "$window", "$facebook", function (isCordova, $window, $facebook) {

  if(isCordova){
    if($window.facebookConnectPlugin){
      return $window.facebookConnectPlugin;
    }else {
      return $facebook;
    }
  }else {
    return $facebook;
  }
}]);

app.factory('UXService', ['$mdDialog', '$mdToast', 'Auth', '$q', '$document',
  function($mdDialog, $mdToast, Auth, $q, $document) {

    var signinModal = function(ev) {
      var d = $q.defer();
      $mdDialog.show({
          controller: 'UXModalLoginCtrl',
          templateUrl: 'partials/app/ux.signin.modal.html',
          parent: document.getElementsByClassName("dialog-holder"),
          targetEvent: ev,
          clickOutsideToClose: true
        })
        .then(function(res) {
          d.resolve(res);
        }, function() {
          d.reject();
        });

      return d.promise;
    };

    var alert = function(ev, text) {
      // Appending dialog to document.body to cover sidenav in docs app
      // Modal dialogs should fully cover application
      // to prevent interaction outside of dialog
      $mdDialog.show(
        $mdDialog.alert()
        .parent(angular.element(document.querySelector('body')))
        .clickOutsideToClose(true)
        .title(text)
        //.content(text)
        .ariaLabel(text)
        .ok('OK')
        .targetEvent(ev)
      );
    };

    var toast = function(text) {
      $mdToast.show(
        $mdToast.simple()
        .content(text)
        .position('top left')
        .parent($document[0].querySelector('body'))
        .hideDelay(7000)
      );

    };

    var UXLoginFB = function() {
      Auth.signinFB().then(function() {
        $mdDialog.hide(true);
      }, function() {
        d = "Do nothing";
      });
    };

    var UXSubmitLogin = function(loginDetails) {
      Auth.signin(loginDetails).then(function(r) {
        $mdDialog.hide(true);
      }, function(err) {
        console.log(err);
        //console.log($scope.loginDetails);
      });
    };



    return {

      signinModal: signinModal,
      alert: alert,
      toast: toast,
      UXLoginFB: UXLoginFB,
      UXSubmitLogin: UXSubmitLogin

    };
  }
]);

app.factory('Auth',
  ["$localStorage", "Restangular", "$q", "$state", "FB", "isCordova", "NotificationsService", "TokenService", "Pusher", function($localStorage, Restangular, $q, $state, FB, isCordova, NotificationsService, TokenService, Pusher) {
    var user = {
      authenticated: false,
      id: null,
      hash_id: null,
      name: "Guest",
      firstName: "Guest",
      lastName: "Guest",
      sex: null,
      location: null,
      email: null,
      avatar: null,
      profile: null
    };

    Restangular.setFullResponse(true);

    var refreshProfile = function() {

      var d = $q.defer();
      if (TokenService.token().hash_id && TokenService.token().exp > Date
        .now() / 1000) {

        Restangular.one('users', TokenService.token().hash_id).get({
          profile: true
        }).then(
          function(r) {
            buildAuthProfile(r.data);
            Pusher.headerAuthBearerRefresh();

            NotificationsService.reInitPusher();

            d.resolve(true);
          },
          function(r) {
            if (r.status == 404) {
              resetProfile();
              //console.log("user not found");
              logout();
            }
            d.resolve(false);

          });
      } else {
        //console.log(Date.now() / 1000);
        //console.log(getClaimsFromToken().exp);
        //delete $localStorage.token;
        resetProfile();
      }

      return d.promise;
    };

    var buildAuthProfile = function(u) {
      //console.log(u);
      user.authenticated = true;
      user.id = u.id;
      user.hash_id = u.hash_id;
      user.name = u.first_name + ' ' + u.last_name;
      user.firstName = u.first_name;
      user.lastName = u.last_name;
      user.username = u.username;
      user.location = u.location;
      user.email = u.email;
      user.avatar = u.avatar;
      user.profile = u.profile;
    };

    var saveToken = function(token) {

      $localStorage.token = token;
      user.token = token;
    };

    var signup = function(newUser) {
      var d = $q.defer();

      Restangular.service('signup').post(newUser).then(function(r) {
        //console.log(r);
        saveToken(r.data.token);
        refreshProfile(); //Refresh session data here
        //$scope.refreshProfile();
        $state.go('web.app.dashboard.centered.home');
        d.resolve(r.data.token);
      }, function() {
        d.reject();
      });

      return d.promise;
    };

    var signin = function(l) {
      var d = $q.defer();

      Restangular.service('authenticate').post(l).then(function(r) {
        //console.log(r);
        saveToken(r.data.token);
        refreshProfile(); //Refresh session data here
        //$scope.refreshProfile();
        $state.go('web.app.dashboard.centered.home');
        d.resolve(r.data.token);
      }, function() {
        d.reject();
      });

      return d.promise;
    };

    var signinFB = function() {
      //console.log("loginctrl");
      var d = $q.defer();

      var doFbLogin = function(fb_response) {
        //console.log('called');
        var d = $q.defer();
        r = fb_response;
        if (r.status === 'connected') {
          json = {
            "fb_access_token": r.authResponse.accessToken
          };
          Restangular.service('fb-token').post(json).then(function(r) {
            saveToken(r.data.token);
            refreshProfile(); //Refresh session data here
            //console.log(r);
            d.resolve(r);
          }, function(r) {
            d.reject(r);
          });
        } else {
          //console.log('reject');
          d.reject();

        }
        return d.promise;
      };

      FB.login(['public_profile', 'email']).then(function(r) {
        //console.log(r);
        doFbLogin(r).then(function() {
          d.resolve();
        }, function(r) {
          d.reject(r);
        });
      }, function(){
        d.reject();
      });

      return d.promise;
    };

    var logout = function() {
      NotificationsService.unsubscribe();
      tokenClaims = {};
      delete $localStorage.token;
      refreshProfile();
      $state.go('web.app.login');
    };

    var resetProfile = function() {
      user.authenticated = false;
      user.id = null;
      user.hash_id = null;
      user.name = "Guest";
      user.firstName = "Guest";
      user.lastName = "Guest";
      user.sex = null;
      user.location = null;
      user.email = null;
      user.avatar = null;
    };

    return {
      signup: signup,
      signin: signin,
      signinFB: signinFB,
      logout: logout,
      refreshProfile: refreshProfile,
      resetProfile: resetProfile,
      userProfile: user,
    };
  }]
);

app.factory('Me', ['Auth', 'Restangular', '$q', 'TokenService', function(Auth, Restangular, $q, TokenService) {

  var uid = TokenService.token().sub;
  //console.log(uid);

  var me = Restangular.one('users', uid);

  var sendPost = function(o) {
    return Restangular.all('posts').post({
      "post": o.post,
      "anonymous": o.anonymous,
      "categories": o.categories,
      "images": o.images
    });
  };

  return {
    id: uid,
    me: me,
    authenticated: Auth.userProfile.authenticated,
    favorites: me.all('favorites'),
    profile: Auth.userProfile,
    sendPost: sendPost

  };
}]);

app.factory('PostService', ["Restangular", "UXService", "Pusher", "$q", "$timeout", "$rootScope", function(Restangular, UXService, Pusher, $q, $timeout, $rootScope) {

    var pubStreamPosts = {
      data: [],
      status: 0
    };

    var postsCat = {
      data: [],
      status: 0
    };

    var post = {
        data: {},
        status: false
    };

    var loadPosts = function() {
        pubStreamPosts.status = 1;
        Restangular.all('posts').getList().then(function(r) {
          pubStreamPosts.data = r.data;
          pubStreamPosts.status = 0;
        }, function(err) {
          pubStreamPosts.status = 2;
          UXService.toast("Something's wrong");
        });
    };

    var smartLoad = function() {
        if (pubStreamPosts.data.length > 0){
            after = pubStreamPosts.data[0].id;
            Restangular.all('posts').getList({
                after: after
            }).then(function(r){
                posts = r.data;
                for (var i = 0; i < posts.length; i++){
                    pubStreamPosts.data.unshift(posts[i]);
                }
            });
        }else{
            loadPosts();
        }
    };

    var loadCategorized = function(category) {
      var param = null;

      if (category) {
        load({
          category: category
        });
      } else {
        load({});
      }

      function load(param) {
            postsCat.status = 1;

            Restangular.all('posts').getList(param).then(function(r) {
                    postsCat.data = r.data;
                    postsCat.status = 0;
                }, function(err) {
                    postsCat.status = 2;
                    UXService.toast("Something's wrong");
                });
        }
    };

    smartLoad();

    pStream = Pusher.pusher.subscribe('posts-stream');
    pStream.bind('new_post', function(post){
        pubStreamPosts.data.unshift(post);
        if(! $rootScope.$$phase){
            $rootScope.$digest();
        }
    });
    pStream.bind('pusher:subscription_succeeded', function (){
        smartLoad();
    });

    return {
        stream: pubStreamPosts,
        categorized: postsCat,
        loadCategorized: loadCategorized
    };

}]);

app.factory('MessageService', ["$rootScope", "Auth", "Restangular", "UXService", "$q", "$timeout", function($rootScope, Auth, Restangular, UXService, $q, $timeout){
    var messages = {
        data: []
    };

    var loadMessages = (function() {
        Restangular.one('me').all('messages').getList().then(
          function(r) {
            var chats = r.data;

            var getOtherUserFromSubs = function(subs){
              var count  = subs.length;

              for(var i = 0; i < count; i++){
                if(subs[i].user_id != Auth.userProfile.id){
                  return subs[i].user;
                }
              }
            };

            var count = r.data.length;
            for(var i = 0; i < count; i++){
              chats[i].otherUser = getOtherUserFromSubs(r.data[i].subs);
            }

            messages.data = r.data;

        },function(err) {
              $timeout(function(){
                  loadMessages();
              }, 10000);
          });
    })();

    return {
        messages: messages
    };
}]);

app.factory('CommentService', ['Restangular', '$q', function(Restangular, $q) {

  var posts = Restangular.all('comments');

  var comment = function(id) {
    return Restangular.one('comments', id);
  };

  return {
    comment: comment
  };

}]);

app.factory('SocialService', ['FB', 'Auth', function(FB, Auth) {


  return {

  };
}]);

app.factory('PChannels', ["TokenService", "Pusher", function(TokenService, Pusher){

  var notif_channel = Pusher.pusher.subscribe('private-notifications-' + TokenService.token().hash_id);

  var notifications_subscribe = function(){
    //var channel = Pusher.pusher.subscribe('private-notifications-' + TokenService.token().hash_id);
    //notifications = channel;
    notif_channel.subscribe('private-notifications-' + TokenService.token().hash_id);
  };

  var notifications = Pusher.pusher.subscribe('private-notifications-' + TokenService.token().hash_id);

  return {
    notifications: notifications,
    notifications_subscribe: notifications_subscribe,
    notifications_unsubscribe: function (){
      return Pusher.pusher.unsubscribe('private-notifications-' + TokenService.token().hash_id);
    }
  };
}]);

app.factory('NotificationsService', ["TokenService", "Pusher", "$state", "$stateParams", "$rootScope", "Restangular", function(TokenService, Pusher, $state, $stateParams, $rootScope, Restangular){

  var n_chanell = null;

  var m_notif = [];
  var notifs = [];
  var f_requests = [];

  var getIndexById = function(arr, obj){
    var count = arr.length;
    for(var i = 0; i < count; i++){
      if(arr[i].id == obj.id){
        return i;
      }
    }
    return -1;
  };

  var checkIfCurrentChat = function(chat){
    if($state.current.name == "web.app.dashboard.message"){
        var count = chat.users.length;

        for(i = 0; i < count; i++){
          if(chat.users[i].hash_id == $stateParams.user_id || chat.users[i].username == $stateParams.user_id){
            return true;
          }
        }
        return false;
      }
    };

  var initPusher = function(){
    if(!TokenService.token().hash_id)
      return;

    var n = Pusher.pusher.subscribe('private-notifications-' + TokenService.token().hash_id);
    n_chanell = n;
    n.bind('new_message', function(data) {
      if(!checkIfCurrentChat(data)){
        var idx = getIndexById(m_notif, data);
        if(idx == -1){
          m_notif.push(data);
          if(!$rootScope.$$phase){
            $rootScope.$digest();
          }
        }
      }
    });

    n.bind('pusher:subscription_succeeded', function(status) {
      Restangular.one('me').all('messages').all('unread').getList().then(
        function(r){
          var count = r.data.length;
          m_notif.splice(0, r.data.length);//Clear the array first
          for(var i = 0; i < count; i++){
            //console.log(i, count);
            //var idx = getIndexById(m_notif, r.data[i]);
            //if(idx == -1){
              m_notif.push(r.data[i]);//repopulate the array since its from the server
            //}
          }

          if(!$rootScope.$$phase){
            $rootScope.$digest();
          }

        }
      );
      Restangular.one('me').all('notifications').getList().then(
        function(r){
          var count = r.data.length;
          notifs.splice(0, r.data.length);//Clear the array first
          for(var i = 0; i < count; i++){
              notifs.push(r.data[i]);//repopulate the array since its from the server
          }

          if(!$rootScope.$$phase){
            $rootScope.$digest();
          }

        }
      );
      Restangular.one('me').all('friend_requests').getList().then(
        function(r){
          var count = r.data.length;
          f_requests.splice(0, r.data.length);//Clear the array first
          for(var i = 0; i < count; i++){
              f_requests.push(r.data[i]);//repopulate the array since its from the server
          }

          if(!$rootScope.$$phase){
            $rootScope.$digest();
          }

        }
      );
    });

    n.bind('pusher:subscription_error', function(status) {
      if(status == 408 || status == 503){
        // retry?
      }
    });
  };

  var clearNotifications = function(chat_id){

    Restangular.one('me').one('messages', chat_id).one('read').patch();

    var idx = getIndexById(m_notif, chat_id);
    if(idx >= 0){
      m_notif.splice(idx, 1);
    }
  };

  var unsubscribe = function (){
    n_chanell.unsubscribe('private-notifications-' + TokenService.token().hash_id);
  };

  initPusher();

  return {
    MessageNotifications: m_notif,
    Notifications: notifs,
    FriendRequestNotifications: f_requests,
    clearNotifications: clearNotifications,
    unsubscribe: unsubscribe,
    reInitPusher: initPusher
  };
}]);

app.factory('UtilityService', function(){

  var findHighestID = function(arr){
    var count = arr.length;
    //console.log(arr, count);
    return arr[count - 1].id;
  };

  var findHighestTimestamp = function(arr){
    var count = arr.length;
    return arr[count - 1].created_at;
  };

  return {
    findHighestID: findHighestID,
    findHighestTimestamp: findHighestTimestamp
  };
});

app.factory('FriendshipService', ["Restangular", function(Restangular){

    var acceptRequest = function(userID){
        Restangular.one('me').all('friend_requests').post({
            user_id: userID
        });
    };

    var deleteRelationship = function(userID){
        Restangular.one('me').one('friend_requests', userID).remove();
    };


    return {
        acceptRequest: acceptRequest,
        deleteRelationship: deleteRelationship
    };
}]);

app.factory('EmojioneService', function(){
    var emojione = window.emojione;

    //emojione.imagePathPNG = 'bower_components/emojione/assets/png/';
    emojione.imageType = 'png';
    emojione.sprites = true;

    return {
        emojione: emojione
    };
});

//# sourceMappingURL=../maps/app.js.map
