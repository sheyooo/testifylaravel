app.controller('PostsCtrl', ['AppService', 'Me', '$scope', '$state', '$stateParams', 'Restangular', 'UXService', '$document', function(AppService, Me, $scope, $state, $stateParams, Restangular, UXService, $document) {
    $scope.app = AppService.app; //Post.getList();
    $scope.post_status = {
        loading: false
    };
    var loadPosts = function() {
        var param = null;
        $scope.post_status.loading = true;

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
                AppService.app.posts = r.data;
                /*l = r.data.length;
                for (i = 0; i < l; i++) {
                    AppService.app.posts.unshift(r.data[i]);
                }*/

                $scope.post_status.loading = false;
                //console.log(r.data.plain());
            }, function(err) {
                $scope.post_status.loading = false;
                //console.log(err);
                UXService.toast("Something's wrong");
            });
        }
    };

    loadPosts();



}]);

app.controller('LoginCtrl', ['$scope', 'UXService', 'Facebook', '$q', '$state', 'Auth', 'Me', 'appBase', function($scope, UXService, Facebook, $q, $state, Auth, Me, appBase) {

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
            console.log(err);
            //console.log($scope.loginDetails);
        });
    };

}]);

app.controller('SignupCtrl', ['$scope', 'Facebook', 'Auth', '$location', '$mdDialog', '$state', function($scope, Facebook, Auth, $location, $mdDialog, $state) {
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

}]);

app.controller('LogoutCtrl', ['$scope', 'Auth', 'Me', function($scope, Auth, Me) {
    Auth.logout();
    //$scope.logout();
    console.log("mayama");
}]);

app.controller('ProfileCtrl', ['Restangular', '$scope', '$stateParams', '$state', function(Restangular, $scope, $stateParams, $state) {
    //console.log(profile);
    var user_profile = Restangular.one('users', $stateParams.hash_id);

    $scope.user = {
        profile: {},
        activities: [],
        favorites: [],
        taps: []
    };


    var loadUserProfile = function() {
        user_profile.one('profile').get().then(function(r) {
            $scope.user.profile = r.data;
        });
    };

    var loadUserPosts = function() {
        user_profile.all('activities').getList().then(function(r) {
            $scope.user.activities = r.data;
        });
    };

    var loadUserFavorites = function() {
        user_profile.all('favorites').getList().then(function(r) {
            $scope.user.favorites = r.data;
        });
    };

    var loadUserTaps = function() {
        user_profile.all('taps').getList().then(function(r) {
            $scope.user.taps = r.data;
        });
    };

    loadUserProfile();
    loadUserPosts();
    loadUserFavorites();
    loadUserTaps();


}]);

app.controller('ProfileEditCtrl', ['Restangular', '$scope', '$stateParams', '$state', 'Upload', 'Auth', 'UXService', 'apiBase', function(Restangular, $scope, $stateParams, $state, Upload, Auth, UXService, apiBase) {
    //console.log(profile);
    var user_profile = Restangular.one('users', $stateParams.hash_id);

    $scope.user = Auth.userProfile;

    if (Auth.userProfile.hash_id !== $stateParams.hash_id) {

        $state.go('web.app.dashboard.home');
    }


    $scope.uploadAvatar = function(file) {
        $scope.uploading = true;

        Upload.upload({
            url: apiBase + '/users/' + Auth.userProfile.hash_id + '/profile/avatar',
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
            if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
        }, function(evt) {
            $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
        });
    };


}]);

app.controller('TComposerCtrl', ['$scope', 'UXService', 'AppService', '$mdToast', 'Me', 'Upload', 'apiBase', '$timeout', '$document', '$q', function($scope, UXService, AppService, $mdToast, Me, Upload,
    apiBase, $timeout, $document, $q) {
    $scope.selectedCategories = [];
    $scope.files = [];
    $scope.newPost = {
        creating: false
    };

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
                    $scope.app.posts.unshift(r.data);
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
}]);

app.controller('UXModalLoginCtrl', ['$scope', '$mdDialog', function($scope, $mdDialog) {
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

app.controller('UXModalPostCategorizeCtrl', ['$scope', '$mdDialog', 'AppService', 'selectedCategories', function($scope, $mdDialog, AppService, selectedCategories) {

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
}]);
