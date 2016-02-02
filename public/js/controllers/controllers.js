app.controller('LandingCtrl', ['Auth', '$state', function(Auth, $state) {
  Auth.refreshProfile().then(function(){
    if (Auth.userProfile.authenticated === true) {
      $state.go('web.app.dashboard.home');
    }
  });


}]);

app.controller('PostsCtrl', ['AppService', 'Me', '$scope', '$state',
  '$stateParams', 'Restangular', 'UXService', '$document',
  function(AppService, Me, $scope, $state, $stateParams, Restangular,
    UXService, $document) {
    $scope.home = {
      posts: AppService.app.posts,
      posts_loading: false
    };
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
]);

app.controller('LoginCtrl', ['$scope', 'UXService', 'Facebook', '$q', '$state',
  'Auth', 'Me', 'appBase',
  function($scope, UXService, Facebook, $q, $state, Auth, Me, appBase) {

    if (Auth.userProfile.authenticated === true) {
      $state.go('web.app.dashboard.home');
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
        $state.go('web.app.dashboard.home');
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
        $state.go('web.app.dashboard.home');
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

            $state.go('web.app.dashboard.home');
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
  '$state',
  function(Restangular, $scope, $stateParams, $state) {
    //console.log(profile);
    var user_profile = Restangular.one('users', $stateParams.id);

    $scope.user = {
      profile: {},
      activities: {posts:[], loading: true},
      favorites: {posts:[], loading: true},
      taps: {posts:[], loading: true}
    };

    $scope.loadUserProfile = function() {
      Restangular.one('users', $stateParams.id).one('profile').get().then(function(r){
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
    Restangular.one('users', $stateParams.id).one(
      'profile').get({
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
      $state.go('web.app.dashboard.home');
    }

    $scope.saveAccountInfo = function(obj) {
      Restangular.one('users', $scope.user.hash_id).one('profile').post(
        '', obj).then(function(r) {
        Auth.userProfile.first_name = obj.first_name;
        Auth.userProfile.last_name = obj.last_name;
        Auth.userProfile.username = obj.username;

        $scope.section_account = false;
      });

    };

    $scope.saveAboutInfo = function(obj) {
      Restangular.one('users', $scope.user.hash_id).one('profile').post(
        '', obj);
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
        url: apiBase + '/users/' + Auth.userProfile.hash_id +
          '/profile/avatar',
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
        Restangular.one('users', $scope.user.hash_id).post('password',
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

app.controller('MessagesCtrl', ['$scope', '$state', '$stateParams', 'Restangular', function($scope, $state, $stateParams, Restangular) {
  $scope.messages = [];
  $scope.chats = [];
  $scope.inputMessage = '';

  if ($state.current.name = 'web.app.dashboard.messages') {
    Restangular.all('me').all('messages').getList().then(
      function(r) {
        $scope.chats = r.data;
        //get all active chats
      },function(r) {

      }
    );
  }

  if ($state.current.name = 'web.app.dashboard.message') {
    Restangular.one('users', $stateParams.user_id).get().then(
      function(r) {
        $scope.messagingUser = r.data;
      },function(r) {

    });

    Restangular.all('me').all('messages').all($stateParams.user_id).getList().then(
      function(r) {
        $scope.messages = r.data;
      },function(r) {

    });
  }

  $scope.goToMessage = function(user_id){
    $state.go('web.app.dashboard.message', {user_id: user_id });

  };

  $scope.sendMessage = function(){
    Restangular.all('users').one($stateParams.user_id).all('messages').post({message: $scope.inputMessage}).then(function(r){
      $scope.messages.push(r.data);
    }, function(r){

    })
  }





}]);

app.controller('TComposerCtrl', ['$scope', 'UXService', 'AppService',
  '$mdToast', 'Me', 'Upload', 'apiBase', '$timeout', '$document', '$q',
  function($scope, UXService, AppService, $mdToast, Me, Upload,
    apiBase, $timeout, $document, $q) {
    $scope.selectedCategories = [];
    $scope.files = [];
    $scope.newPost = {
      creating: false
    };

    $timeout(function() {
      angular.element(document.querySelector('.emoji-wysiwyg-editor')).on(
        'focus',
        function() {
          $scope.composingPost = true;
          $scope.$digest();
        });
    }, 0);

    AppService.getCategories.then(function(cats) {
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
      post = $scope.post;
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

          $scope.emojiMessage.rawhtml = "";
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

    AppService.getCategories.then(function(res) {
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
