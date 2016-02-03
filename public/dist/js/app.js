var app=angular.module("testify",["ngMaterial","chieffancypants.loadingBar","ngAnimate","ngMessages","angularMoment","ui.router","ngStorage","restangular","facebook","ngFileUpload","ngImgCrop","ngTextTruncate","emojiApp","ngCordova"]);-1===document.URL.indexOf("http://")&&-1===document.URL.indexOf("https://")?(app.constant("apiBase","https://testify-staging.herokuapp.com/api/v1"),app.constant("appBase","/"),app.constant("appUrl","https://testify-staging.herokuapp.com")):(app.constant("appUrl","https://testify-staging.herokuapp.com"),app.constant("appBase","/"),app.constant("apiBase","api/v1")),app.config(["$compileProvider","$logProvider","$animateProvider",function(e,t,a){t.debugEnabled(!1),e.debugInfoEnabled(!1)}]),app.config(["FacebookProvider","$httpProvider","RestangularProvider","apiBase",function(e,t,a,r){e.setAppId(0xa3bf7aae624f),a.setBaseUrl(r),t.interceptors.push(["$q","$location","$localStorage",function(e,t,a,r,o){return{request:function(e){return e.headers=e.headers||{},a.token&&(e.headers.Authorization="Bearer "+a.token),e},response:function(e){var t=e.headers("Authorization");return t&&(t.replace("Bearer ",""),a.token=t),e},responseError:function(r){return(401===r.status||400===r.status||403===r.status)&&("token_expired"==r.data.error?(delete a.token,o.resetProfile(),t.path("/signin")):"token_invalid"==r.data.error?(delete a.token,o.resetProfile(),t.path("/signin")):"Bad Authorization"==r.data.error?(delete a.token,o.resetProfile(),t.path("/signin")):"token_not_provided"==r.data.error&&(delete a.token,o.resetProfile(),t.path("/signin")),console.log("Unauthorized or forbidden")),e.reject(r)}}}])}]),app.run(["$cordovaSplashscreen","$cordovaKeyboard","$cordovaStatusbar",function(e,t,a){window.addEventListener("load",function(){new FastClick(document.body)},!1),-1===document.URL.indexOf("http://")&&-1===document.URL.indexOf("https://")&&document.addEventListener("deviceready",function(){a.style(1),a.styleHex("#819CAD"),t.hideAccessoryBar(!0),e.hide()},!1)}]),app.config(["$mdThemingProvider",function(e){var t=e.extendPalette("blue",{contrastDefaultColor:"light",contrastDarkColors:"200, 300",contrastLightColors:"500",500:"97B6CA",50:"1C3456",100:"5DADE0",200:"e74c3c",300:"FFFFFF",400:"F4F4F4",600:"27ae60",700:"77777E"});e.definePalette("palette",t),e.theme("default").primaryPalette("palette",{"default":"500","hue-1":"50","hue-2":"100","hue-3":"300"}).accentPalette("palette",{"default":"200","hue-1":"600","hue-2":"700"}).warnPalette("red",{}),e.theme("input","default").primaryPalette("grey",{}).backgroundPalette("palette",{"default":"500"}).dark(),e.theme("search","default").primaryPalette("yellow",{}).backgroundPalette("palette",{"default":"50"}).dark()}]),app.config(["$stateProvider","$urlRouterProvider","$locationProvider","appBase",function(e,t,a,r){e.state("web",{"abstract":!0,templateUrl:"views/web.html"}).state("web.app",{"abstract":!0,url:r,templateUrl:"views/web.app.html"}).state("web.app.login",{url:"login",templateUrl:"views/web.app.login.html"}).state("web.app.signup",{url:"signup",controller:"LoginCtrl",templateUrl:"views/web.app.signup.html"}).state("web.app.logout",{url:"logout",controller:"LogoutCtrl",template:" "}).state("web.app.landing",{url:"",templateUrl:"views/web.app.landing.html"}).state("web.app.forgot",{url:"forgot",templateUrl:"views/web.app.forgot-password.html"}).state("web.app.dashboard",{"abstract":!0,url:"",templateUrl:"views/web.app.dashboard.html"}).state("web.app.dashboard.home",{url:"home",templateUrl:"views/web.app.dashboard.home.html"}).state("web.app.dashboard.messages",{url:"messages",templateUrl:"views/web.app.dashboard.messages.html"}).state("web.app.dashboard.message",{url:"messages/:user_id",templateUrl:"views/web.app.dashboard.message.html"}).state("web.app.dashboard.post",{url:"posts/:hash_id",templateUrl:"views/web.app.dashboard.post.html"}).state("web.app.dashboard.posts",{url:"posts?cat",templateUrl:"views/web.app.dashboard.home.html"}).state("web.app.dashboard.user",{url:"user/:id",resolve:{profile:["$stateParams","Restangular",function(e,t){return t.one("users",e.id).get()}]},views:{"":{templateUrl:"views/web.app.dashboard.profile.html",controller:"ProfileCtrl"},"@web.app.dashboard.user":{templateUrl:"views/web.app.dashboard.profile.activities.html"}}}).state("web.app.dashboard.user.activities",{url:"/activities",templateUrl:"views/web.app.dashboard.profile.activities.html"}).state("web.app.dashboard.user.favorites",{url:"/favorites",templateUrl:"views/web.app.dashboard.profile.favorites.html"}).state("web.app.dashboard.user.taps",{url:"/taps",templateUrl:"views/web.app.dashboard.profile.taps.html"}).state("web.app.dashboard.user.edit",{url:"/edit",views:{"@web.app.dashboard":{templateUrl:"views/web.app.dashboard.profile.edit.html"}}}),t.otherwise(r+"home"),-1===document.URL.indexOf("http://")&&-1===document.URL.indexOf("https://")||a.html5Mode({enabled:!0,requireBase:!1})}]);
app.controller("AppCtrl",["$rootScope","$scope","$mdSidenav","$mdMedia","$location","$state","$q","AppService","Auth","Me","appBase","$filter","PusherService",function(e,t,o,a,n,i,s,r,c,u,d,h,l){t.location=n,t.user=c.userProfile,t.composingPost=!1,t.tokHashId=c.token.hash_id,t.ui={showSearch:!1,showSideNav:i,toggleNav:function(e){o(e).toggle()},toggleSearchBox:function(){t.ui.showSearch=!t.ui.showSearch}},r.getCategoriesWithCount.then(function(e){for(var o=e.data.length,a=0;o>a;a++)e.data[a].count=h("socialCounter")(e.data[a].count);t.categories=e.data});var p;t.openMenu=function(e,t){p=t,e(t)},t.logout=function(){c.logout()},t.redirect=function(e){i.go(e)},t.menu=[{link:"",state:"web.app.dashboard.home",title:"Feeds",icon:"home",condition:!0,click:""}],t.menuAuth=[{link:"profile",state:"web.app.dashboard.user({id: user.username || user.hash_id})",title:"Profile",icon:"account",condition:"user.authenticated",action:null},{link:"",state:"web.app.dashboard.messages",title:"Messages",icon:"message-text-outline",condition:"user.authenticated",click:""},{link:"",state:"web.app.dashboard.user.favorites({id: user.username || user.hash_id})",title:"Favourites",icon:"star",condition:"user.authenticated",action:null},{link:"",state:"web.app.dashboard.user.edit({id: user.username || user.hash_id})",title:"Preferences",icon:"settings",condition:"user.authenticated",action:null}],t.getSearchResultIcon=function(e){return icon[e]},t.searchIcons={tag:"pound",user:"at"},t.searchRepo=function(e){var t=s.defer();return r.search.getList({q:e}).then(function(e){t.resolve(e.data.plain())},function(){t.reject()}),t.promise}}]);
app.controller("LandingCtrl",["Auth","$state",function(e,o){e.refreshProfile().then(function(){e.userProfile.authenticated===!0&&o.go("web.app.dashboard.home")})}]),app.controller("PostsCtrl",["AppService","Me","$scope","$state","$stateParams","Restangular","UXService","$document",function(e,o,t,s,a,n,i,r){if(t.home={posts:[],posts_loading:!1},"web.app.dashboard.post"==s.current.name&&(t.home.posts_loading=!0,n.one("posts",a.hash_id).get().then(function(e){t.home.posts=[e.data],t.home.posts_loading=!1})),"web.app.dashboard.home"==s.current.name,!0){var u=function(){function o(o){e.getPosts.getList(o).then(function(o){t.home.posts=o.data,e.app.posts=o.data,t.home.posts_loading=!1},function(e){t.home.posts_loading=!1,i.toast("Something's wrong")})}t.home.posts_loading=!0,o(a.cat?{category:a.cat}:{})};u()}}]),app.controller("LoginCtrl",["$scope","UXService","Facebook","$q","$state","Auth","Me","appBase",function(e,o,t,s,a,n,i,r){n.userProfile.authenticated===!0&&a.go("web.app.dashboard.home"),e.fb_button="Login with Facebook",t.getLoginStatus(function(o){"connected"===o.status?t.api("/me",function(o){e.fb_logged_in=!0,e.fb_name=o.name,e.fb_button="Continue as "+e.fb_name}):(e.fb_logged_in=!1,e.fb_name="null",e.fb_button="Login with Facebook")}),e.loginFB=function(){n.signinFB().then(function(){a.go("web.app.dashboard.home")},function(e){o.toast(e.data.error)})},e.UXLoginFB=function(){o.UXLoginFB()},e.UXSubmitLogin=function(){o.UXSubmitLogin(e.loginDetails)};e.submitLogin=function(){n.signin(e.loginDetails).then(function(e){a.go("web.app.dashboard.home")},function(e){o.toast("Wrong username or password")})}}]),app.controller("SignupCtrl",["$scope","Facebook","Auth","$location","$mdDialog","$state",function(e,o,t,s,a,n){var i;e.newUser={},e.signupFb=function(){o.login().then(function(){i()})},i=function(){o.api("/me",{fields:"id,first_name,last_name,email"}).then(function(e){o.logout()},function(e){a.show(a.alert().parent(angular.element(document.querySelector("body"))).clickOutsideToClose(!0).title("Login failed!").ariaLabel("Failed login").ok("close"))})},e.submitForm=function(){e.signupForm.$valid&&t.signup(e.newUser).then(function(e){n.go("web.app.dashboard.home")},function(e){})}}]),app.controller("LogoutCtrl",["$scope","Auth","Me",function(e,o,t){o.logout(),console.log("mayama")}]),app.controller("ProfileCtrl",["Restangular","$scope","$stateParams","$state","Auth",function(e,o,t,s,a){o.me=a.userProfile;var n=e.one("users",t.id);o.user={profile:{},activities:{posts:[],loading:!0},favorites:{posts:[],loading:!0},taps:{posts:[],loading:!0}},o.loadUserProfile=function(){e.one("users",t.id).one("profile").get().then(function(e){o.user_profile=e.data})},o.loadUserActivities=function(){o.user.activities.loading=!0,n.all("activities").getList().then(function(e){o.user.activities.posts=e.data,o.user.activities.loading=!1})},o.loadUserFavorites=function(){o.user.favorites.loading=!0,n.all("favorites").getList().then(function(e){o.user.favorites.posts=e.data,o.user.favorites.loading=!1})},o.loadUserTaps=function(){o.user.taps.loading=!0,n.all("taps").getList().then(function(e){o.user.taps.posts=e.data,o.user.taps.loading=!1})};var i=function(){switch(o.loadUserProfile(),s.current.name){case"web.app.dashboard.user.favorites":o.loadUserFavorites();break;case"web.app.dashboard.user.taps":o.loadUserTaps();break;case"web.app.dashboard.user.activities":o.loadUserActivities();break;default:o.loadUserActivities()}};i()}]),app.controller("ProfileEditCtrl",["Restangular","$scope","$stateParams","$state","Upload","Auth","UXService","apiBase",function(e,o,t,s,a,n,i,r){e.one("users",t.id).one("profile").get({profile:!0}).then(function(e){o.user_profile=e.data}),o.user=n.userProfile,n.userProfile.hash_id!=t.id&&n.userProfile.username!=t.id&&(console.log(t),s.go("web.app.dashboard.home")),o.saveAccountInfo=function(t){e.one("users",o.user.hash_id).one("profile").post("",t).then(function(e){n.userProfile.first_name=t.first_name,n.userProfile.last_name=t.last_name,n.userProfile.username=t.username,o.section_account=!1})},o.saveAboutInfo=function(t){e.one("users",o.user.hash_id).one("profile").post("",t),n.userProfile.location=t.location,null===n.userProfile.profile&&(n.userProfile.profile={}),n.userProfile.profile.favorite_book=t.favorite_book,n.userProfile.profile.favorite_verse=t.favorite_verse,n.userProfile.profile.favorite_parable=t.favorite_parable,n.userProfile.profile.denomination=t.denomination,o.section_about_me=!1},o.uploadAvatar=function(e){o.uploading=!0,a.upload({url:r+"/users/"+n.userProfile.hash_id+"/profile/avatar",data:{file:a.dataUrltoBlob(e)}}).then(function(e){n.userProfile.avatar=e.data.url,i.toast("Successfully updated your display picture")},function(){i.toast("Changing display picture wasn't successful")})["finally"](function(){o.uploading=!1,o.picFile=""})},o.upload=function(e){console.log(9),a.upload({url:"https://angular-file-upload-cors-srv.appspot.com/upload",data:{file:a.dataUrltoBlob(e)}}).then(function(e){$timeout(function(){o.result=e.data})},function(e){e.status>0&&(o.errorMsg=e.status+": "+e.data)},function(e){o.progress=parseInt(100*e.loaded/e.total)})},o.changePassword=function(){o.password.newPassword&&o.password.newPassword1&&o.password.newPassword===o.password.newPassword1?e.one("users",o.user.hash_id).post("password",o.password).then(function(e){202==e.status&&i.toast("Successfully changed password")},function(e){i.toast("Something's wrong")}):i.toast("Please repeat the password")}}]),app.controller("MessagesCtrl",["$scope","$state","$stateParams","Restangular","Auth",function(e,o,t,s,a){e.messages=[],e.chats=[],e.inputMessage="","web.app.dashboard.messages"===o.current.name&&s.all("me").all("messages").getList().then(function(o){var t=function(e){var o=e.length;for(i=0;i<o;i++)if(e[i].id!=a.userProfile.id)return console.log(e[i]),e[i]},s=o.data.length;for(i=0;i<s;i++)o.data[i].otherUser=t(o.data[i].users);e.chats=o.data},function(e){}),"web.app.dashboard.message"===o.current.name&&(s.one("users",t.user_id).get().then(function(o){e.messagingUser=o.data},function(e){}),s.all("me").all("messages").all(t.user_id).getList().then(function(o){e.messages=o.data},function(e){})),e.goToMessage=function(e){o.go("web.app.dashboard.message",{user_id:e})},e.sendMessage=function(){e.inputMessage.trim()&&s.all("users").one(t.user_id).all("messages").post({message:e.inputMessage}).then(function(o){e.messages.push(o.data),e.inputMessage=""},function(e){})}}]),app.controller("TComposerCtrl",["$scope","UXService","AppService","$mdToast","Me","Upload","apiBase","$timeout","$document","$q",function(e,o,t,s,a,n,i,r,u,l){e.selectedCategories=[],e.files=[],e.newPost={creating:!1},r(function(){angular.element(document.querySelector(".emoji-wysiwyg-editor")).on("focus",function(){e.composingPost=!0,e.$digest()})},0),t.getCategories.then(function(o){e.categories=o.data;for(var t=e.categories.length,s=0;t>s;s++)if("General"==e.categories[s].name){e.selectedCategories.push(e.categories[s]);break}}),e.toggleCatPopup=function(){e.showSelectCatPopup=!e.showSelectCatPopup},e.catsClick=function(o){var t=e.selectedCategories.indexOf(o);t>-1?e.selectedCategories.splice(t,1):e.selectedCategories.push(o)},e.catsExists=function(o){return"General"==o.name&&0===e.categories.length?!0:e.selectedCategories.indexOf(o)>-1};e.removePicture=function(o){e.files.splice(o,1)};var c=function(o){var t=l.defer(),s=[];e.files=o;var a=function(e){e.file=e,e.upload=n.upload({url:i+"/images",data:{file:e}}),e.upload.then(function(a){e.complete=!0,e.result=a.data,s.push(a.data.image_id),o.length==s.length&&t.resolve(s)},function(a){e.failed=!0,o.length==s.length&&t.resolve(s)},function(o){e.progress=Math.min(100,parseInt(100*o.loaded/o.total))})};return o&&o.length&&angular.forEach(o,function(e){a(e)}),t.promise};e.composePost=function(t){post=e.post,anonymous=e.anonymous,post||(post=" "),"undefined"==typeof anonymous?anonymous=0:anonymous.$viewValue===!1||anonymous===!1?anonymous=0:anonymous=1;var s=function(o){e.newPost.creating=!0;for(var t=[],s=e.selectedCategories.length,n=0;s>n;n++)t.push(e.selectedCategories[n].id);a.sendPost({post:o.p,anonymous:o.a,categories:t,images:o.i}).then(function(o){e.newPost.creating=!1,201===o.status&&e.home.posts.unshift(o.data),e.emojiMessage.rawhtml="",e.post="",e.composingPost=!1,e.files=[]},function(o){e.newPost.creating=!1})};e.files.length?c(e.files).then(function(e){s({p:post.trim(),a:anonymous,i:e})}):post.trim()?s({p:post.trim(),a:anonymous,i:[]}):o.toast("Your post has no content!")}}]),app.controller("UXModalLoginCtrl",["$scope","$mdDialog",function(e,o){e.hide=function(){o.hide()},e.cancel=function(){o.cancel()},e.answer=function(e){o.hide(e)}}]),app.controller("UXModalPostCategorizeCtrl",["$scope","$mdDialog","AppService","selectedCategories",function(e,o,t,s){t.getCategories.then(function(o){e.categories=o.data,console.log(e.actives)}),e.hide=function(){o.hide()},e.cancel=function(){o.cancel()},e.filePostIn=function(t){console.log(e.selectedCategories),o.hide(t)}}]);
app.directive("leftSidenav",[function(){return{restrict:"A",transclude:!0,replace:!0,templateUrl:"partials/app/left-sidenav.html"}}]),app.directive("rightSidenav",[function(){return{restrict:"A",transclude:!0,replace:!0,templateUrl:"partials/app/right-sidenav.html"}}]),app.directive("searchbox",[function(){return{restrict:"A",transclude:!0,replace:!0,templateUrl:"partials/app/searchbox.html"}}]),app.directive("appToolbar",[function(){return{restrict:"A",transclude:!0,replace:!0,templateUrl:"partials/app/app-toolbar.html"}}]),app.directive("appToolbarNoLogin",[function(){return{restrict:"A",transclude:!0,replace:!0,templateUrl:"partials/app/app-toolbar-no-login.html"}}]),app.directive("testifyPosts",["PostService",function(t){return{restrict:"A",transclude:!0,replace:!0,templateUrl:"partials/templates/Post/posts.html",scope:{posts:"=testifyPosts",loading:"=loading"},controller:["$scope",function(o){this.SDeletePost=function(e){t.post(e).remove().then(function(t){var n=o.posts.map(function(t){return t.id}).indexOf(e);o.posts.splice(n,1)})},o.noPosts=!1}]}}]),app.directive("testifyPost",["PostService","CommentService","Auth","UXService","Facebook","appUrl","$filter",function(t,o,e,n,s,a,p){return{restrict:"A",require:"^?testifyPosts",scope:{post:"=testifyPost"},templateUrl:"partials/templates/Post/post.html",link:function(r,c,u,m){r.user=e.userProfile,r.CommentsUI={loading:!1,retryButton:!1};var d={"App\\Tap":["tapped into","this post"],"App\\Favorite":["favorited","this post"],"App\\Amen":["said amen","to this post"],"App\\Comment":["commented","on this post"]};if(r.post.user_ref_activities&&r.post.user_ref_activities.length>0){interpretation="",i=0;var f,_=r.post.user_ref_activities;if(l=r.post.user_ref_activities.length,1==l)a_t=_[0].action_type,interpretation+=" "+d[a_t][0]+" "+d[a_t][1];else if(2==l)for(f in _)i++,a_t=_[f].action_type,i==l-1&&(interpretation+=" "+d[a_t][0]),i==l&&(interpretation+=" and "+d[a_t][0]+" "+d[a_t][1]);else if(l>2)for(f in _)i++,a_t=_[f].action_type,i==l-(l-1)?interpretation+=" "+d[a_t][0]:i<=l-1?interpretation+=", "+d[a_t][0]:l>=i&&(interpretation+=" and "+d[a_t][0]+" "+d[a_t][1]);r.interpretation=interpretation}r.showMore=!1;var h,v,g=r.post.text.split(" ").length;if(v=p("colonToSmiley")(r.post.text),g>60){var y=r.post.text.split(" ");h=y.slice(0,59).join(" ")+"...",h=p("colonToSmiley")(h),r.optimizedText=h,r.post_truncate=!0}else r.optimizedText=v;r.toggleMore=function(){r.showMore?r.optimizedText=h:r.optimizedText=v,r.showMore=!r.showMore};var C;r.openMenu=function(t,o){C=o,t(o)},r.post.prayer&&(r.amens_count=p("socialCounter")(r.post.amens_count)),r.taps_count=p("socialCounter")(r.post.taps_count),r.comments_count=p("socialCounter")(r.post.comments_count),r.showCommentBox=!1,r.openCommentBox=function(){r.CommentsUI.loading=!0,r.CommentsUI.retryButton=!1,t.post(r.post.id).getList("comments").then(function(t){r.post.comments=t.data,r.CommentsUI.loading=!1},function(t){r.CommentsUI.retryButton=!0,r.CommentsUI.loading=!1}),r.showCommentBox=!0},r.addComment=function(o){var i=function(){r.commentBox&&t.post(r.post.id).post("comments",{text:r.commentBox}).then(function(t){r.post.comments_count++,r.comments_count=p("socialCounter")(r.post.comments_count),r.post.comments.unshift(t.data),r.commentBox=""},function(t){n.toast("Sorry, couldn't post your comment check your network and try again ")})};e.userProfile.authenticated?i():n.signinModal(o).then(function(){i()},function(){n.toast("Sorry, we couldn't sign you check your network and try again")})},r.deleteComment=function(t){var e=o.comment(t);e.remove().then(function(o){var e=r.post.comments.map(function(t){return t.id}).indexOf(t);r.post.comments.splice(e,1),r.post.comments_count--,r.comments_count=p("socialCounter")(r.post.comments_count)})},r.toggleFavorite=function(o){var i=function(){r.post.favorited?(r.post.favorited=!1,r.post.favorites_count--,t.post(r.post.id).one("favorites").remove().then(function(t){r.post.favorited=t.data.status,r.post.favorites_count=t.data.count})):(r.post.favorited=!0,r.post.favorites_count++,t.post(r.post.id).one("favorites").post().then(function(t){r.post.favorited=t.data.status,r.post.favorites_count=t.data.count}))};e.userProfile.authenticated?i():n.signinModal(o).then(function(){i()})},r.toggleTap=function(o){var i=function(){r.post.tapped_into?(r.post.tapped_into=!1,r.post.taps_count--,t.post(r.post.id).one("taps").remove().then(function(t){r.post.tapped_into=t.data.status,r.post.taps_count=t.data.count,r.taps_count=p("socialCounter")(r.post.taps_count)})):(r.post.tapped_into=!0,r.post.taps_count++,t.post(r.post.id).one("taps").post().then(function(t){r.post.tapped_into=t.data.status,r.post.taps_count=t.data.count,r.taps_count=p("socialCounter")(r.post.taps_count)}))};e.userProfile.authenticated?i():n.signinModal(o).then(function(){i()})},r.sayAmen=function(o){var i=function(){r.post.amen=!0,r.post.amens_count++,t.post(r.post.id).one("amens").post().then(function(t){r.post.amen=t.data.status,r.post.amens_count=t.data.count,r.amens_count=p("socialCounter")(r.post.amens_count)})};e.userProfile.authenticated?i():n.signinModal(o).then(function(){i()})},r.shareToFb=function(){var t={method:"feed",link:a,picture:a+"/dist/img/testify-fb-share-pic.png",name:"Testify",caption:"Sharing God's goodness",description:r.post.text+" (Tesfify is a community for sharing your testimonies and engaging with other people's testimonies)"};isCordova?$cordovaFacebook.showDialog(t).then(function(t){},function(t){}):s.ui(t,function(t){})},r.deletePost=function(){m.SDeletePost(r.post.id)}}}}]),app.directive("myIcon",["$timeout",function(t){return{restrict:"E",scope:{icon:"@"},replace:!0,link:function(t,o,e){},template:"<i class='mdi mdi-{{::icon}}'></i>"}}]),app.directive("testifyComposer",[function(){return{restrict:"A",templateUrl:"partials/app/testifyComposer.html"}}]);
app.filter("socialCounter",function(){return function(t){return out=t,t&&(t>=999&&999999>t?out=Math.round(t/100)/10+"K":t>=999999&&999999999>t?out=Math.round(t/1e5)/10+"M":t>=999999999&&(out=Math.round(t/1e8)/10+"B")),out}});
app.factory("isCordova",[function(){var e=-1===document.URL.indexOf("http://")&&-1===document.URL.indexOf("https://");return e}]),app.factory("AppService",["Restangular","Auth","Me",function(e,t,n){var o={posts:[]};t.refreshProfile().then(function(e){});var a=e.service("search"),r=e.all("posts"),i=e.all("categories").getList(),s=e.all("categories").getList({count:!0});return{app:o,search:a,getPosts:r,getCategories:i,getCategoriesWithCount:s}}]),app.factory("PusherService",["Auth",function(e){Pusher.log=function(e){window.console&&window.console.log&&window.console.log(e)};var t=new Pusher("b5fa9d11972af2e0b8d1",{encrypted:!0,authEndpoint:"api/v1/pusher/auth",auth:{headers:{Authorization:"Bearer "+e.rawToken}}}),n=t.subscribe("test_channel");n.bind("my_event",function(e){alert(e.message)});var o="private-notifications-"+e.token.hash_id,a=t.subscribe(o);return a.bind("new_message",function(e){console.log(e)}),{pusher:t,notifications:a}}]),app.factory("FB",["isCordova","Facebook","$window",function(e,t,n){return e&&n.facebookConnectPlugin?n.facebookConnectPlugin:t}]),app.factory("UXService",["$mdDialog","$mdToast","Auth","$q","$document",function(e,t,n,o,a){var r=function(t){var n=o.defer();return e.show({controller:"UXModalLoginCtrl",templateUrl:"partials/app/ux.signin.modal.html",parent:document.getElementsByClassName("dialog-holder"),targetEvent:t,clickOutsideToClose:!0}).then(function(e){n.resolve(e)},function(){n.reject()}),n.promise},i=function(t,n){e.show(e.alert().parent(angular.element(document.querySelector("body"))).clickOutsideToClose(!0).title(n).ariaLabel(n).ok("OK").targetEvent(t))},s=function(e){t.show(t.simple().content(e).position("top left").parent(a[0].querySelector("body")).hideDelay(7e3))},u=function(){n.signinFB().then(function(){e.hide(!0)},function(){d="Do nothing"})},c=function(t){n.signin(t).then(function(t){e.hide(!0)},function(e){console.log(e)})};return{signinModal:r,alert:i,toast:s,UXLoginFB:u,UXSubmitLogin:c}}]),app.factory("Auth",["$http","$localStorage","Restangular","$q","$state","$cordovaFacebook","Facebook","isCordova",function(e,t,n,o,a,i,s,u){function c(e){var t=e.replace("-","+").replace("_","/");switch(t.length%4){case 0:break;case 2:t+="==";break;case 3:t+="=";break;default:throw"Illegal base64url string!"}return window.atob(t)}function l(){var e=t.token,n={};if("undefined"!=typeof e){var o=e.split(".")[1];n=JSON.parse(c(o))}return n}var f={authenticated:!1,id:null,hash_id:null,name:"Guest",firstName:"Guest",lastName:"Guest",sex:null,location:null,email:null,avatar:null,profile:null};n.setFullResponse(!0);var p=t.token,d=function(){var e=o.defer();return l().hash_id&&l().exp>Date.now()/1e3?n.one("users",l().hash_id).get({profile:!0}).then(function(t){h(t.data),e.resolve(!0)},function(t){404==t.status&&(w(),k()),e.resolve(!1)}):w(),e.promise},h=function(e){f.authenticated=!0,f.id=e.id,f.hash_id=e.hash_id,f.name=e.first_name+" "+e.last_name,f.firstName=e.first_name,f.lastName=e.last_name,f.username=e.username,f.location=e.location,f.email=e.email,f.avatar=e.avatar,f.profile=e.profile},m=function(e){t.token=e,f.token=e},g=function(e){var t=o.defer();return n.service("signup").post(e).then(function(e){m(e.data.token),d(),a.go("web.app.dashboard.home"),t.resolve(e.data.token)},function(){t.reject()}),t.promise},v=function(e){var t=o.defer();return n.service("authenticate").post(e).then(function(e){m(e.data.token),d(),a.go("web.app.dashboard.home"),t.resolve(e.data.token)},function(){t.reject()}),t.promise},b=function(){var e=o.defer(),t=function(e){var t=o.defer();return r=e,"connected"===r.status?(json={fb_access_token:r.authResponse.accessToken},n.service("fb-token").post(json).then(function(e){m(e.data.token),d(),t.resolve(e)},function(e){t.reject(e)})):t.reject(),t.promise};return u?i.login(["public_profile","email"]).then(function(n){console.log(n),t(n).then(function(){e.resolve()},function(t){e.reject(t)})},function(){e.reject()}):s.login(function(n){t(n).then(function(){e.resolve()},function(t){e.reject(t)})}),e.promise},k=function(){tokenClaims={},delete t.token,d(),a.go("web.app.login")},w=function(){f.authenticated=!1,f.id=null,f.hash_id=null,f.name="Guest",f.firstName="Guest",f.lastName="Guest",f.sex=null,f.location=null,f.email=null,f.avatar=null};return{signup:g,signin:v,signinFB:b,logout:k,refreshProfile:d,resetProfile:w,userProfile:f,token:l(),rawToken:p}}]),app.factory("Me",["Auth","Restangular","$q",function(e,t,n){var o=e.token.sub,a=t.one("users",o),r=function(e){return t.all("posts").post({post:e.post,anonymous:e.anonymous,categories:e.categories,images:e.images})};return{id:o,me:a,authenticated:e.userProfile.authenticated,favorites:a.all("favorites"),profile:e.userProfile,sendPost:r}}]),app.factory("PostService",["Restangular","$q",function(e,t){var n=(e.all("posts"),function(t){return e.one("posts",t)});return{post:n}}]),app.factory("CommentService",["Restangular","$q",function(e,t){var n=(e.all("comments"),function(t){return e.one("comments",t)});return{comment:n}}]),app.factory("SocialService",["Facebook","Auth",function(e,t){return{}}]);
//# sourceMappingURL=../maps/app.js.map
