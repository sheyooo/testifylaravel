app.factory('AppService', ['Restangular', 'Auth', 'Me', function(Restangular, Auth, Me) {

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

    var getCategories = Restangular.all('categories').getList();


    return {
        app: app,
        search: search,
        getPosts: getPosts,
        getCategories: getCategories

    };
}]);

app.factory('Auth', ['$http', '$localStorage', 'Restangular', '$q', '$state', 'Facebook', function($http, $localStorage, Restangular, $q, $state, Facebook) {
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
        avatar: "img/guest.png",
    };

    Restangular.setFullResponse(true);

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

    function getClaimsFromToken() {
        var token = $localStorage.token;
        var claims = {};

        //console.log(token);
        if (typeof token !== 'undefined') {
            var encoded = token.split('.')[1];
            claims = JSON.parse(urlBase64Decode(encoded));
        }

        return claims;
    }

    var refreshProfile = function() {
        //console.log("refresh")
        //console.log(getClaimsFromToken());

        var d = $q.defer();
        if (getClaimsFromToken().hash_id && getClaimsFromToken().exp > Date.now() / 1000) {
            //console.log("truthy");
            //console.log(getClaimsFromToken().hash_id);
            //console.log(Date.now() / 1000);
            //console.log(getClaimsFromToken().exp);

            Restangular.one('users', getClaimsFromToken().hash_id).get().then(function(r) {
                buildAuthProfile(r.data);
                d.resolve(true);
                //console.log(getClaimsFromToken().id);
            }, function(r) {
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
        user.sex = u.sex;
        user.location = u.state + ' ' + u.country;
        user.email = u.email;
        user.avatar = u.avatar;
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
            $state.go('web.app.dashboard.home');
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
            $state.go('web.app.dashboard.home');
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
                d.reject();
            }
            return d.promise;
        };

        Facebook.login(function(r) {
            //console.log(r);
            doFbLogin(r).then(function() {
                d.resolve();
            }, function(r) {
                d.reject(r);
            });
        });

        return d.promise;
    };

    var logout = function() {
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
        user.avatar = "img/guest.png";
    };

    return {
        signup: signup,
        signin: signin,
        signinFB: signinFB,
        logout: logout,
        refreshProfile: refreshProfile,
        resetProfile: resetProfile,
        userProfile: user,
        token: getClaimsFromToken()
    };
}]);

app.factory('Me', ['Auth', 'Restangular', '$q', function(Auth, Restangular, $q) {

    var uid = Auth.token.sub;
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

app.factory('PostService', ['Restangular', '$q', function(Restangular, $q) {

    var posts = Restangular.all('posts');

    var post = function(id) {
        return Restangular.one('posts', id);
    };

    return {
        post: post
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

app.factory('SocialService', ['Facebook', 'Auth', function(Facebook, Auth) {


    return {

    };
}]);

app.factory('UXService', ['$mdDialog', '$mdToast', 'Auth', '$q', '$document', function($mdDialog, $mdToast, Auth, $q, $document) {

    var signinModal = function(ev) {
        var d = $q.defer();
        $mdDialog.show({
                controller: 'UXModalLoginCtrl',
                templateUrl: 'partials/ux.signin.modal.html',
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
}]);
