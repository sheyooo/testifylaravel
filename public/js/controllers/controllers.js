app.controller('LandingCtrl', ['Auth', '$state', function(Auth, $state) {
  Auth.refreshProfile().then(function(){
    if (Auth.userProfile.authenticated === true) {
      $state.go('web.app.dashboard.centered.home');
    }
  });


}]);

app.controller('PostsCtrl', ['AppService', 'Me', '$scope', '$state',
  '$stateParams', 'Restangular', 'UXService', '$document',
  function(AppService, Me, $scope, $state, $stateParams, Restangular,
    UXService, $document) {

      $scope.home = {
        posts: [],
        posts_loading: false
      };

      if ($state.current.name == "web.app.dashboard.post") {
        $scope.home.posts_loading = true;

        Restangular.one('posts', $stateParams.hash_id).get().then(
          function(r) {
            $scope.home.posts = [r.data];
            $scope.home.posts_loading = false;
          }
        );
      }

      if ($state.current.name == "web.app.dashboard.centered.home" || "web.app.dashboard.posts"){
        var loadPosts = function() {
          var param = null;
          $scope.home.posts_loading = true;

          if ($stateParams.cat) {
            load({
              category: $stateParams.cat
            });
          } else {
            load({});
          }


          function load(param) {

            AppService.getPosts.getList(param).then(function(r) {
              //console.log(AppService.app);
              $scope.home.posts = r.data;
              AppService.app.posts = r.data;
              /*l = r.data.length;
              for (i = 0; i < l; i++) {
                  AppService.app.posts.unshift(r.data[i]);
              }*/

              $scope.home.posts_loading = false;
              //console.log(r.data.plain());
            }, function(err) {
              $scope.home.posts_loading = false;
              //console.log(err);
              UXService.toast("Something's wrong");
            });
          }
        };

        loadPosts();
      }


  }
]);

app.controller('LoginCtrl', ['$scope', 'UXService', 'Facebook', '$q', '$state',
  'Auth', 'Me', 'appBase',
  function($scope, UXService, Facebook, $q, $state, Auth, Me, appBase) {

    if (Auth.userProfile.authenticated === true) {
      $state.go('web.app.dashboard.centered.home');
    }

    $scope.fb_button = "Login with Facebook";

    Facebook.getLoginStatus(function(r) {
      //console.log(r);
      if (r.status === 'connected') {
        //console.log(r);
        Facebook.api('/me', function(r) {
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
      Facebook.api("/me", {
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

app.controller('SignupCtrl', ['$scope', 'Facebook', 'Auth', '$location',
  '$mdDialog', '$state',
  function($scope, Facebook, Auth, $location, $mdDialog, $state) {
    var refresh;

    $scope.newUser = {};
    $scope.signupFb = function() {
      Facebook.login().then(function() {
        refresh();
      });
    };

    refresh = function() {
      Facebook.api("/me", {
        fields: 'id,first_name,last_name,email'
      }).then(
        function(response) {
          Facebook.logout();
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
      activities: {posts:[], loading: true},
      favorites: {posts:[], loading: true},
      taps: {posts:[], loading: true}
    };

    $scope.loadUserProfile = function() {
      Restangular.one('users', $stateParams.id).get({
          profile: true
      }).then(function(r){
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

    $scope.sendFriendRequest = function(id){
      Restangular.one('me').all('friends').post({user_id: id});

    };

    var load = function(){
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
      if(Auth.userProfile.profile === null){
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

app.controller('MessagesCtrl', ['$scope', '$state', '$stateParams', 'Restangular', 'Auth' , 'Pusher', function($scope, $state, $stateParams, Restangular, Auth, Pusher) {
  $scope.chats = [];

  Restangular.all('me').all('messages').getList().then(
    function(r) {
      //console.log(r);
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

      $scope.chats = chats;
    },function(r) {

    }
  );

}]);

app.controller('MessageCtrl', ['$scope', '$rootScope', 'messagingUser', 'Restangular', 'Auth', '$stateParams', '$state', 'Pusher', 'NotificationsService', 'UtilityService', function($scope, $rootScope, messagingUser, Restangular, Auth, $stateParams, $state, Pusher, NotificationsService, UtilityService){
  $scope.messages = [];
  $scope.inputMessage = '';
  $scope.messagingUser = messagingUser;
  var chat_channel = "";
  var chat_id = null;//will be set after call to server in restangular promise

  if(!$stateParams.user_id){
    $state.go('web.app.dashboard.centered.home');
  }

  var push_new_message = function(message){
    $scope.messages.push(message);

    if(!$scope.$$phase){
      $scope.$digest();
    }

    $("#messages-container").animate({
        scrollTop: $("#messages-container")[0].scrollHeight + 500
    }, 500);

    NotificationsService.clearNotifications(chat_id);//TO-DO::: MAKE THIS A SERVER CALL TO CLEAR NOTIFICATION ON SERVER SIDE
  };

  var subscription_succeeded = function(message){
    //$scope.messages.push(message);
    smartLoad($scope.messages);
  };

  var smartLoad = function(messages){
    var id = UtilityService.findHighestID(messages);
    //console.log(id);

    Restangular.all('me').all('messages').one($stateParams.user_id).get({
      after: id
    }).then(
      function(r) {
        //console.log($stateParams.user_id);
        var count = r.data.length;
        if(count){
          for(var i = 0; i < count; i++){
            $scope.messages.push(r.data[i]);
          }
          NotificationsService.clearNotifications(chat_id);
        }

        $("#messages-container").animate({
            scrollTop: $("#messages-container")[0].scrollHeight + 500
        }, 1);

      },function(r) {

    });

  };

  Restangular.all('me').all('messages').one($stateParams.user_id).getList().then(
    function(r) {
      //console.log(r.headers('X-CHAT-ID'));
      chat_id = r.headers('X-CHAT-ID');
      chatChannel = 'private-message-' + chat_id;
      $scope.messages = r.data;
      if(r.length){
        NotificationsService.clearNotifications(chat_id);
      }
      var pm = Pusher.pusher.subscribe(chatChannel);

      pm.bind('new_message', push_new_message);
      pm.bind('pusher:subscription_succeeded', subscription_succeeded);

      $("#messages-container").animate({
          scrollTop: $("#messages-container")[0].scrollHeight + 500
      }, 1);

    },function(r) {

  });

  $scope.sendMessage = function(){
      if($scope.inputMessage.trim()){
        Restangular.all('users').one($stateParams.user_id).all('messages').post({
          message: $scope.inputMessage,
          socket_id: Pusher.pusher.connection.socket_id
        }).then(function(r){
          $scope.messages.push(r.data);
          $scope.inputMessage = '';
          $("#messages-container").animate({
              scrollTop: $("#messages-container")[0].scrollHeight + 500
          }, 1);
        }, function(r){

        });
      }else{
        //Do nothing!!!;
      }

    };

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
    Pusher.pusher.unsubscribe(chatChannel);
  });



}]);

app.controller('TComposerCtrl', ['$scope', 'UXService', 'AppService',
  '$mdToast', 'Me', 'Upload', 'apiBase', '$timeout', '$document', 'EmojioneService', '$q',
  function($scope, UXService, AppService, $mdToast, Me, Upload,
    apiBase, $timeout, $document, EmojioneService, $q) {
    $scope.selectedCategories = [];
    $scope.files = [];
    $scope.newPost = {
      creating: false
    };

    $timeout(function () {
        emojionearea = $('#tComposerInput').emojioneArea({
          template : "<editor/><filters/><tabs/>",
          autoHideFilters : true,
          useSprite : true,
          placeholder : "Share your testimony...",
          container : null,
          hideSource : true,

        });
        $scope.emojionearea = emojionearea[0].emojioneArea;
        //console.log($scope.emojionearea);
    }, 01);

    $timeout(function () {
      angular.element(document.querySelector('.emojionearea-editor')).on(
        'focus',
        function() {
          $scope.composingPost = true;
          if(!$scope.$$phase){
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
          images: o.i
        }).then(function(r) {
          $scope.newPost.creating = false;

          if (r.status === 201) {
            $scope.home.posts.unshift(r.data);
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
  }
]);

app.controller('NotificationsController', function($scope, Restangular, NotificationsService, FriendshipService){
    var types = {
        'App\\Post': 'created a post',
        'App\\Tap': 'tapped on a post',
        'App\\Amen': 'said amen to a post',
        'App\\Favorite': 'favorited a post',
        'App\\Comment': 'commented on a post',
    };

  Restangular.one('me').all('friend_requests').getList().then(function(r){
    $scope.friend_requests = r.data;
  });
  Restangular.one('me').all('notifications').getList({
      "profiles": true
  }).then(function(r){
    //$scope.notifications = r.data;
    $scope.notifications = [];

    notifs = r.data;

    for (var i = 0; i < notifs.length; i++){
        aNotif = {
            content: types[notifs[i].action_type],
            user: notifs[i].user
        };

        $scope.notifications.push(aNotif);
    }


  });

  $scope.acceptRequest = FriendshipService.acceptRequest;
  $scope.deleteRelationship = FriendshipService.deleteRelationship;

});

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
