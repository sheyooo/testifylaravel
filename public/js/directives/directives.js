(function(){
    'use strict';

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
            controller: function($scope) {
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
            }
        };
    }]);

    app.directive('testifyPost', function(Restangular, CommentService, Auth, UXService, FB, $cordovaFacebook, appUrl, $filter, EmojioneService, isCordova) {
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
                                } else if (l >= i || i > 3) {
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
    });

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

    app.directive('testifyComposer', function($timeout) {
        return {
            restrict: 'A',
            templateUrl: 'partials/app/testifyComposer.html',
            link: function(scope, elem, attrs) {


            }
            //controller: 'TComposerCtrl'
        };
    });
})();
