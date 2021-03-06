app.factory('isCordova', [function() {
    var cordova = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
    return cordova;
}]);

app.factory('TokenService', function($localStorage) {

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

    var rawToken = function() {
        return $localStorage.token;
    };

    return {
        token: getClaimsFromToken,
        rawToken: rawToken
    };
});

app.factory('AppService', ['Restangular', 'Auth', 'Me', '$q', '$timeout', function(Restangular,
    Auth, Me, $q, $timeout) {

    var testifyCategories = [];
    var testifyCategoriesWCnt = [];

    Auth.refreshProfile().then(function(r) {
        //Me.callInit();
        //console.log("letsee");
    });
    //console.log("appService");

    var search = Restangular.service('search');

    var getCategories = function() {
        var d = $q.defer();

        if (testifyCategories.length !== 0) {
            d.resolve(testifyCategories);
        } else {
            (function makeCall() {
                Restangular.all('categories').getList().then(function(r) {
                    testifyCategories = r;
                    d.resolve(r);
                }, function() {
                    $timeout(function() {
                        makeCall();
                    }, 10000);
                });
            })();
        }

        return d.promise;
    };

    var getCategoriesWithCount = function() {
        var d = $q.defer();

        if (testifyCategoriesWCnt.length !== 0) {
            d.resolve(testifyCategoriesWCnt);
        } else {
            (function makeCall() {
                Restangular.all('categories').getList({
                    count: true
                }).then(function(r) {
                    testifyCategoriesWCnt = r;
                    d.resolve(r);
                }, function() {
                    $timeout(function() {
                        makeCall();
                    }, 10000);
                });
            })();
        }

        return d.promise;
    };


    return {
        app: app,
        search: search,
        getCategories: getCategories,
        getCategoriesWithCount: getCategoriesWithCount

    };
}]);

app.factory('Pusher', ['TokenService', 'isCordova', 'apiBase', function(TokenService, isCordova, apiBase) {

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

    var headerAuthBearerRefresh = function() {
        pusher.config.auth.headers.Authorization = 'Bearer ' + TokenService.rawToken();
    };

    return {
        pusher: pusher,
        headerAuthBearerRefresh: headerAuthBearerRefresh
    };
}]);

app.factory('FB', function(isCordova, $window, $facebook) {

    if (isCordova) {
        if ($window.facebookConnectPlugin) {
            return $window.facebookConnectPlugin;
        } else {
            return $facebook;
        }
    } else {
        return $facebook;
    }
});

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
    function($localStorage, Restangular, $q, $state, FB, isCordova, NotificationsService, TokenService, Pusher) {
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
            }, function() {
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
    }
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

app.factory('PostService', function(Restangular, UXService, Pusher, $q, $timeout, $rootScope) {

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
        status: 0
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
        if (pubStreamPosts.data.length > 0) {
            pubStreamPosts.status = 1;
            after = pubStreamPosts.data[0].id;
            Restangular.all('posts').getList({
                after: after
            }).then(function(r) {
                posts = r.data;
                for (var i = 0; i < posts.length; i++) {
                    pubStreamPosts.data.unshift(posts[i]);
                }
                pubStreamPosts.status = 0;
            });
        } else {
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
    pStream.bind('new_post', function(post) {
        pubStreamPosts.data.unshift(post);
        if (!$rootScope.$$phase) {
            $rootScope.$digest();
        }
    });
    pStream.bind('pusher:subscription_succeeded', function() {
        smartLoad();
    });

    return {
        stream: pubStreamPosts,
        categorized: postsCat,
        loadCategorized: loadCategorized
    };

});

app.factory('MessageService', function($rootScope, Auth, Restangular, UXService, $q, $timeout) {
    var messages = {
        data: [],
        status: 0
    };

    var loadMessages = (function() {
        messages.status = 1;

        Restangular.one('me').all('messages').getList().then(
            function(r) {
                var chats = r.data;

                var getOtherUserFromSubs = function(subs) {
                    var count = subs.length;

                    for (var i = 0; i < count; i++) {
                        if (subs[i].user_id != Auth.userProfile.id) {
                            return subs[i].user;
                        }
                    }
                };

                var count = r.data.length;
                for (var i = 0; i < count; i++) {
                    chats[i].otherUser = getOtherUserFromSubs(r.data[i].subs);
                }

                messages.data = r.data;
                messages.status = 0;

            },
            function(err) {
                messages.status = 0;

                $timeout(function() {
                    loadMessages();
                }, 10000);
            });
    })();

    return {
        messages: messages
    };
});

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

app.factory('PChannels', function(TokenService, Pusher) {

    var notif_channel = Pusher.pusher.subscribe('private-notifications-' + TokenService.token().hash_id);

    var notifications_subscribe = function() {
        //var channel = Pusher.pusher.subscribe('private-notifications-' + TokenService.token().hash_id);
        //notifications = channel;
        notif_channel.subscribe('private-notifications-' + TokenService.token().hash_id);
    };

    var notifications = Pusher.pusher.subscribe('private-notifications-' + TokenService.token().hash_id);

    return {
        notifications: notifications,
        notifications_subscribe: notifications_subscribe,
        notifications_unsubscribe: function() {
            return Pusher.pusher.unsubscribe('private-notifications-' + TokenService.token().hash_id);
        }
    };
});

app.factory('NotificationsService', function(TokenService, Pusher, $state, $stateParams, $rootScope, Restangular) {

    var n_chanell = null;

    var m_notif = [];
    var notifs = [];
    var f_requests = [];

    var getIndexById = function(arr, obj) {
        var count = arr.length;
        for (var i = 0; i < count; i++) {
            if (arr[i].id == obj.id) {
                return i;
            }
        }
        return -1;
    };

    var checkIfCurrentChat = function(chat) {
        if ($state.current.name == "web.app.dashboard.message") {
            var count = chat.users.length;

            for (i = 0; i < count; i++) {
                if (chat.users[i].hash_id == $stateParams.user_id || chat.users[i].username == $stateParams.user_id) {
                    return true;
                }
            }
            return false;
        }
    };

    var initPusher = function() {
        if (!TokenService.token().hash_id)
            return;

        var n = Pusher.pusher.subscribe('private-notifications-' + TokenService.token().hash_id);
        n_chanell = n;
        n.bind('new_message', function(data) {
            if (!checkIfCurrentChat(data)) {
                var idx = getIndexById(m_notif, data);
                if (idx == -1) {
                    m_notif.push(data);
                    if (!$rootScope.$$phase) {
                        $rootScope.$digest();
                    }
                }
            }
        });

        n.bind('pusher:subscription_succeeded', function(status) {
            Restangular.one('me').all('messages').all('unread').getList().then(
                function(r) {
                    var count = r.data.length;
                    m_notif.splice(0, r.data.length); //Clear the array first
                    for (var i = 0; i < count; i++) {
                        //console.log(i, count);
                        //var idx = getIndexById(m_notif, r.data[i]);
                        //if(idx == -1){
                        m_notif.push(r.data[i]); //repopulate the array since its from the server
                        //}
                    }

                    if (!$rootScope.$$phase) {
                        $rootScope.$digest();
                    }

                }
            );
            Restangular.one('me').all('notifications').getList().then(
                function(r) {
                    var count = r.data.length;
                    notifs.splice(0, r.data.length); //Clear the array first
                    for (var i = 0; i < count; i++) {
                        notifs.push(r.data[i]); //repopulate the array since its from the server
                    }

                    if (!$rootScope.$$phase) {
                        $rootScope.$digest();
                    }

                }
            );
            Restangular.one('me').all('friend_requests').getList().then(
                function(r) {
                    var count = r.data.length;
                    f_requests.splice(0, r.data.length); //Clear the array first
                    for (var i = 0; i < count; i++) {
                        f_requests.push(r.data[i]); //repopulate the array since its from the server
                    }

                    if (!$rootScope.$$phase) {
                        $rootScope.$digest();
                    }

                }
            );
        });

        n.bind('pusher:subscription_error', function(status) {
            if (status == 408 || status == 503) {
                // retry?
            }
        });
    };

    var clearNotifications = function(chat_id) {

        Restangular.one('me').one('messages', chat_id).one('read').patch();

        var idx = getIndexById(m_notif, chat_id);
        if (idx >= 0) {
            m_notif.splice(idx, 1);
        }
    };

    var unsubscribe = function() {
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
});

app.factory('UtilityService', function() {

    var findHighestID = function(arr) {
        var count = arr.length;
        if (!count) {
            return 0;
        }

        return arr[count - 1].id;
        //console.log(arr, count);
    };

    var findHighestTimestamp = function(arr) {
        var count = arr.length;
        return arr[count - 1].created_at;
    };

    return {
        findHighestID: findHighestID,
        findHighestTimestamp: findHighestTimestamp
    };
});

app.factory('FriendshipService', function(Restangular) {

    var acceptRequest = function(userID) {
        return Restangular.one('me').all('friend_requests').post({
            user_id: userID
        });
    };

    var deleteRelationship = function(userID) {
        return Restangular.one('me').one('friend_requests', userID).remove();
    };


    return {
        acceptRequest: acceptRequest,
        deleteRelationship: deleteRelationship
    };
});

app.factory('EmojioneService', function() {
    var emojione = window.emojione;
    //emojione.imagePathPNG = 'bower_components/emojione/assets/png/';
    emojione.imageType = 'png';
    emojione.sprites = true;
    emojione.ascii = true;

    return {
        emojione: emojione
    };
});
