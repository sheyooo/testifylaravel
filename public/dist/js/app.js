var app=angular.module("testify",["ngMaterial","chieffancypants.loadingBar","ngAnimate","ngMessages","angularMoment","ui.router","ngStorage","restangular","facebook","ngFileUpload","ngImgCrop","ngTextTruncate","emojiApp"]),cordova=-1===document.URL.indexOf("http://")&&-1===document.URL.indexOf("https://");cordova?(app.constant("apiBase","https://testify-staging.herokuapp.com/api/v1"),app.constant("appBase","/"),app.constant("appUrl","https://testify-staging.herokuapp.com")):(app.constant("appUrl","https://testify-staging.herokuapp.com"),app.constant("appBase","/"),app.constant("apiBase","api/v1")),app.config(["$compileProvider",function(e){e.debugInfoEnabled(!1)}]),app.config(["FacebookProvider","$httpProvider","RestangularProvider","apiBase",function(e,t,a,r){e.setAppId(0xa3bf7aae624f),a.setBaseUrl(r),t.interceptors.push(["$q","$location","$localStorage",function(e,t,a,r,o){return{request:function(e){return e.headers=e.headers||{},a.token&&(e.headers.Authorization="Bearer "+a.token),e},response:function(e){var t=e.headers("Authorization");return t&&(t.replace("Bearer ",""),a.token=t),e},responseError:function(r){return(401===r.status||400===r.status||403===r.status)&&("token_expired"==r.data.error?(delete a.token,o.resetProfile(),t.path("/signin")):"token_invalid"==r.data.error?(delete a.token,o.resetProfile(),t.path("/signin")):"Bad Authorization"==r.data.error?(delete a.token,o.resetProfile(),t.path("/signin")):"token_not_provided"==r.data.error&&(delete a.token,o.resetProfile(),t.path("/signin")),console.log("Unauthorized or forbidden")),e.reject(r)}}}])}]),app.run(function(){cordova&&FastClick.attach(document.body)}),app.config(["$mdThemingProvider",function(e){var t=e.extendPalette("blue",{contrastDefaultColor:"light",contrastDarkColors:"200, 300",contrastLightColors:"500",500:"97B6CA",50:"1C3456",100:"5DADE0",200:"e74c3c",300:"FFFFFF",400:"F4F4F4",600:"27ae60",700:"77777E"});e.definePalette("palette",t),e.theme("default").primaryPalette("palette",{"default":"500","hue-1":"50","hue-2":"100","hue-3":"300"}).accentPalette("palette",{"default":"200","hue-1":"600","hue-2":"700"}).warnPalette("red",{}),e.theme("input","default").primaryPalette("grey",{}).backgroundPalette("palette",{"default":"500"}).dark(),e.theme("search","default").primaryPalette("yellow",{}).backgroundPalette("palette",{"default":"50"}).dark()}]),app.config(["$stateProvider","$urlRouterProvider","$locationProvider","appBase",function(e,t,a,r){e.state("web",{"abstract":!0,templateUrl:"views/web.html"}).state("web.app",{"abstract":!0,url:r,templateUrl:"views/web.app.html"}).state("web.app.login",{url:"login",templateUrl:"views/web.app.login.html"}).state("web.app.signup",{url:"signup",controller:"LoginCtrl",templateUrl:"views/web.app.signup.html"}).state("web.app.logout",{url:"logout",controller:"LogoutCtrl",template:" "}).state("web.app.landing",{url:"",templateUrl:"views/web.app.landing.html"}).state("web.app.forgot",{url:"forgot",templateUrl:"views/web.app.forgot-password.html"}).state("web.app.dashboard",{"abstract":!0,url:"",templateUrl:"views/web.app.dashboard.html"}).state("web.app.dashboard.home",{url:"home",templateUrl:"views/web.app.dashboard.home.html"}).state("web.app.dashboard.messages",{url:"messages",templateUrl:"views/web.app.dashboard.messages.html"}).state("web.app.dashboard.post",{url:"post/:hash_id",templateUrl:"views/web.app.dashboard.post.html"}).state("web.app.dashboard.posts",{url:"posts?cat",templateUrl:"views/web.app.dashboard.home.html"}).state("web.app.dashboard.user",{url:"user/:id",resolve:{profile:["$stateParams","Restangular",function(e,t){return t.one("users",e.id).get()}]},views:{"":{templateUrl:"views/web.app.dashboard.profile.html",controller:"ProfileCtrl"},"@web.app.dashboard.user":{templateUrl:"views/web.app.dashboard.profile.activities.html"}}}).state("web.app.dashboard.user.activities",{url:"/activities",templateUrl:"views/web.app.dashboard.profile.activities.html"}).state("web.app.dashboard.user.favorites",{url:"/favorites",templateUrl:"views/web.app.dashboard.profile.favorites.html"}).state("web.app.dashboard.user.taps",{url:"/taps",templateUrl:"views/web.app.dashboard.profile.taps.html"}).state("web.app.dashboard.user.edit",{url:"/edit",views:{"@web.app.dashboard":{templateUrl:"views/web.app.dashboard.profile.edit.html"}}}),t.otherwise(r+"home"),cordova||a.html5Mode({enabled:!0,requireBase:!1})}]);
app.controller("AppCtrl",["$rootScope","$scope","$mdSidenav","$mdMedia","$location","$state","$q","AppService","Auth","Me","appBase",function(e,t,o,n,i,a,s,r,c,u,d){t.location=i,t.user=c.userProfile,t.composingPost=!1,t.tokHashId=c.token.hash_id,t.ui={showSearch:!1,showSideNav:a,toggleNav:function(e){o(e).toggle()},toggleSearchBox:function(){t.ui.showSearch=!t.ui.showSearch}},r.getCategoriesWithCount.then(function(e){t.categories=e.data});var h;t.openMenu=function(e,t){h=t,e(t)},t.logout=function(){c.logout()},t.redirect=function(e){a.go(e)},t.menu=[{link:"",state:"web.app.dashboard.home",title:"Feeds",icon:"home",condition:!0,click:""}],t.menuAuth=[{link:"profile",state:"web.app.dashboard.user({id: user.username || user.hash_id})",title:"Profile",icon:"account",condition:"user.authenticated",action:null},{link:"",state:"web.app.dashboard.messages",title:"Messages",icon:"message-text-outline",condition:"user.authenticated",click:""},{link:"",state:"web.app.dashboard.user.favorites({id: user.username || user.hash_id})",title:"Favourites",icon:"star",condition:"user.authenticated",action:null},{link:"",state:"web.app.dashboard.user.edit({id: user.username || user.hash_id})",title:"Preferences",icon:"settings",condition:"user.authenticated",action:null}],t.getSearchResultIcon=function(e){return icon[e]},t.searchIcons={tag:"pound",user:"at"},t.searchRepo=function(e){var t=s.defer();return r.search.getList({q:e}).then(function(e){t.resolve(e.data.plain())},function(){t.reject()}),t.promise}}]);
app.controller("PostsCtrl",["AppService","Me","$scope","$state","$stateParams","Restangular","UXService","$document",function(e,o,t,n,a,s,i,r){t.app=e.app,t.post_status={loading:!1};var u=function(){function o(o){e.getPosts.getList(o).then(function(o){e.app.posts=o.data,t.post_status.loading=!1},function(e){t.post_status.loading=!1,i.toast("Something's wrong")})}t.post_status.loading=!0,o(a.cat?{category:a.cat}:{})};u()}]),app.controller("LoginCtrl",["$scope","UXService","Facebook","$q","$state","Auth","Me","appBase",function(e,o,t,n,a,s,i,r){s.userProfile.authenticated===!0&&a.go("web.app.dashboard.home"),e.fb_button="Login with Facebook",t.getLoginStatus(function(o){"connected"===o.status?t.api("/me",function(o){e.fb_logged_in=!0,e.fb_name=o.name,e.fb_button="Continue as "+e.fb_name}):(e.fb_logged_in=!1,e.fb_name="null",e.fb_button="Login with Facebook")}),e.loginFB=function(){s.signinFB().then(function(){a.go("web.app.dashboard.home")},function(e){o.toast(e.data.error)})},e.UXLoginFB=function(){o.UXLoginFB()},e.UXSubmitLogin=function(){o.UXSubmitLogin(e.loginDetails)};e.submitLogin=function(){s.signin(e.loginDetails).then(function(e){a.go("web.app.dashboard.home")},function(e){o.toast("Wrong username or password")})}}]),app.controller("SignupCtrl",["$scope","Facebook","Auth","$location","$mdDialog","$state",function(e,o,t,n,a,s){var i;e.newUser={},e.signupFb=function(){o.login().then(function(){i()})},i=function(){o.api("/me",{fields:"id,first_name,last_name,email"}).then(function(e){o.logout()},function(e){a.show(a.alert().parent(angular.element(document.querySelector("body"))).clickOutsideToClose(!0).title("Login failed!").ariaLabel("Failed login").ok("close"))})},e.submitForm=function(){e.signupForm.$valid&&t.signup(e.newUser).then(function(e){s.go("web.app.dashboard.home")},function(e){})}}]),app.controller("LogoutCtrl",["$scope","Auth","Me",function(e,o,t){o.logout(),console.log("mayama")}]),app.controller("ProfileCtrl",["Restangular","$scope","$stateParams","$state",function(e,o,t,n){var a=e.one("users",t.id);o.user={profile:{},activities:[],favorites:[],taps:[]};var s=function(){e.one("users",t.id).one("profile").get().then(function(e){o.user_profile=e.data})},i=function(){a.all("activities").getList().then(function(e){o.user.activities=e.data})},r=function(){a.all("favorites").getList().then(function(e){o.user.favorites=e.data})},u=function(){a.all("taps").getList().then(function(e){o.user.taps=e.data})};s(),i(),r(),u()}]),app.controller("ProfileEditCtrl",["Restangular","$scope","$stateParams","$state","Upload","Auth","UXService","apiBase",function(e,o,t,n,a,s,i,r){e.one("users",t.id).one("profile").get({profile:!0}).then(function(e){o.user_profile=e.data}),o.user=s.userProfile,s.userProfile.hash_id!=t.id&&s.userProfile.username!=t.id&&(console.log(t),n.go("web.app.dashboard.home")),o.saveAccountInfo=function(t){e.one("users",o.user.hash_id).one("profile").post("",t).then(function(e){s.userProfile.first_name=t.first_name,s.userProfile.last_name=t.last_name,s.userProfile.username=t.username,o.section_account=!1})},o.saveAboutInfo=function(t){e.one("users",o.user.hash_id).one("profile").post("",t),s.userProfile.location=t.location,null===s.userProfile.profile&&(s.userProfile.profile={}),s.userProfile.profile.favorite_book=t.favorite_book,s.userProfile.profile.favorite_verse=t.favorite_verse,s.userProfile.profile.favorite_parable=t.favorite_parable,s.userProfile.profile.denomination=t.denomination,o.section_about_me=!1},o.uploadAvatar=function(e){o.uploading=!0,a.upload({url:r+"/users/"+s.userProfile.hash_id+"/profile/avatar",data:{file:a.dataUrltoBlob(e)}}).then(function(e){s.userProfile.avatar=e.data.url,i.toast("Successfully updated your display picture")},function(){i.toast("Changing display picture wasn't successful")})["finally"](function(){o.uploading=!1,o.picFile=""})},o.upload=function(e){console.log(9),a.upload({url:"https://angular-file-upload-cors-srv.appspot.com/upload",data:{file:a.dataUrltoBlob(e)}}).then(function(e){$timeout(function(){o.result=e.data})},function(e){e.status>0&&(o.errorMsg=e.status+": "+e.data)},function(e){o.progress=parseInt(100*e.loaded/e.total)})},o.changePassword=function(){o.password.newPassword&&o.password.newPassword1&&o.password.newPassword===o.password.newPassword1?e.one("users",o.user.hash_id).post("password",o.password).then(function(e){202==e.status&&i.toast("Successfully changed password")},function(e){i.toast("Something's wrong")}):i.toast("Please repeat the password")}}]),app.controller("MessagesCtrl",[function(){}]),app.controller("TComposerCtrl",["$scope","UXService","AppService","$mdToast","Me","Upload","apiBase","$timeout","$document","$q",function(e,o,t,n,a,s,i,r,u,l){e.selectedCategories=[],e.files=[],e.newPost={creating:!1},r(function(){angular.element(document.querySelector(".emoji-wysiwyg-editor")).on("focus",function(){e.composingPost=!0,e.$digest()})},0),t.getCategories.then(function(o){e.categories=o.data;for(var t=e.categories.length,n=0;t>n;n++)if("General"==e.categories[n].name){e.selectedCategories.push(e.categories[n]);break}}),e.toggleCatPopup=function(){e.showSelectCatPopup=!e.showSelectCatPopup},e.catsClick=function(o){var t=e.selectedCategories.indexOf(o);t>-1?e.selectedCategories.splice(t,1):e.selectedCategories.push(o)},e.catsExists=function(o){return"General"==o.name&&0===e.categories.length?!0:e.selectedCategories.indexOf(o)>-1};e.removePicture=function(o){e.files.splice(o,1)};var c=function(o){var t=l.defer(),n=[];e.files=o;var a=function(e){e.file=e,e.upload=s.upload({url:i+"/images",data:{file:e}}),e.upload.then(function(a){e.complete=!0,e.result=a.data,n.push(a.data.image_id),o.length==n.length&&t.resolve(n)},function(a){e.failed=!0,o.length==n.length&&t.resolve(n)},function(o){e.progress=Math.min(100,parseInt(100*o.loaded/o.total))})};return o&&o.length&&angular.forEach(o,function(e){a(e)}),t.promise};e.composePost=function(t){post=e.post,anonymous=e.anonymous,post||(post=" "),"undefined"==typeof anonymous?anonymous=0:anonymous.$viewValue===!1||anonymous===!1?anonymous=0:anonymous=1;var n=function(o){e.newPost.creating=!0;for(var t=[],n=e.selectedCategories.length,s=0;n>s;s++)t.push(e.selectedCategories[s].id);a.sendPost({post:o.p,anonymous:o.a,categories:t,images:o.i}).then(function(o){e.newPost.creating=!1,201===o.status&&e.app.posts.unshift(o.data),e.emojiMessage.rawhtml="",e.post="",e.composingPost=!1,e.files=[]},function(o){e.newPost.creating=!1})};e.files.length?c(e.files).then(function(e){n({p:post.trim(),a:anonymous,i:e})}):post.trim()?n({p:post.trim(),a:anonymous,i:[]}):o.toast("Your post has no content!")}}]),app.controller("UXModalLoginCtrl",["$scope","$mdDialog",function(e,o){e.hide=function(){o.hide()},e.cancel=function(){o.cancel()},e.answer=function(e){o.hide(e)}}]),app.controller("UXModalPostCategorizeCtrl",["$scope","$mdDialog","AppService","selectedCategories",function(e,o,t,n){t.getCategories.then(function(o){e.categories=o.data,console.log(e.actives)}),e.hide=function(){o.hide()},e.cancel=function(){o.cancel()},e.filePostIn=function(t){console.log(e.selectedCategories),o.hide(t)}}]);
app.directive("leftSidenav",[function(){return{restrict:"A",transclude:!0,replace:!0,templateUrl:"partials/app/left-sidenav.html"}}]),app.directive("rightSidenav",[function(){return{restrict:"A",transclude:!0,replace:!0,templateUrl:"partials/app/right-sidenav.html"}}]),app.directive("searchbox",[function(){return{restrict:"A",transclude:!0,replace:!0,templateUrl:"partials/app/searchbox.html"}}]),app.directive("appToolbar",[function(){return{restrict:"A",transclude:!0,replace:!0,templateUrl:"partials/app/app-toolbar.html"}}]),app.directive("appToolbarNoLogin",[function(){return{restrict:"A",transclude:!0,replace:!0,templateUrl:"partials/app/app-toolbar-no-login.html"}}]),app.directive("testifyPosts",["PostService",function(t){return{restrict:"A",transclude:!0,replace:!0,templateUrl:"partials/templates/Post/posts.html",scope:{posts:"=testifyPosts",post_status:"=postStatus"},controller:["$scope",function(e){this.SDeletePost=function(o){t.post(o).remove().then(function(t){var n=e.posts.map(function(t){return t.id}).indexOf(o);e.posts.splice(n,1)})},e.noPosts=!1}]}}]),app.directive("testifyPost",["PostService","CommentService","Auth","UXService","Facebook","appUrl",function(t,e,o,n,s,a){return{restrict:"A",require:"^?testifyPosts",scope:{post:"=testifyPost"},templateUrl:"partials/templates/Post/post.html",link:function(p,r,c,u){p.user=o.userProfile,p.CommentsUI={loading:!1};var m={"App\\Tap":["tapped into","this post"],"App\\Favorite":["favorited","this post"],"App\\Amen":["said amen","to this post"],"App\\Comment":["commented","on this post"]};if(p.post.user_ref_activities&&p.post.user_ref_activities.length>0){interpretation="",i=0;var f,d=p.post.user_ref_activities;if(l=p.post.user_ref_activities.length,1==l)a_t=d[0].action_type,interpretation+=" "+m[a_t][0]+" "+m[a_t][1];else if(2==l)for(f in d)i++,a_t=d[f].action_type,i==l-1&&(interpretation+=" "+m[a_t][0]),i==l&&(interpretation+=" and "+m[a_t][0]+" "+m[a_t][1]);else if(l>2)for(f in d)i++,a_t=d[f].action_type,i==l-(l-1)?interpretation+=" "+m[a_t][0]:i<=l-1?interpretation+=", "+m[a_t][0]:l>=i&&(interpretation+=" and "+m[a_t][0]+" "+m[a_t][1]);p.interpretation=interpretation}var h;p.openMenu=function(t,e){h=e,t(e)},p.showCommentBox=!1,p.openCommentBox=function(){p.showCommentBox===!1&&(p.CommentsUI.loading=!0,t.post(p.post.id).getList("comments").then(function(t){p.post.comments=t.data,p.CommentsUI.loading=!1},function(t){p.CommentsUI.loading=!1})),p.showCommentBox=!0},p.addComment=function(e){var i=function(){p.commentBox&&t.post(p.post.id).post("comments",{text:p.commentBox}).then(function(t){p.post.comments_count++,p.post.comments.unshift(t.data),p.commentBox=""})};o.userProfile.authenticated?i():n.signinModal(e).then(function(){i()},function(){v="Unsuccessful login"})},p.deleteComment=function(t){var o=e.comment(t);o.remove().then(function(e){var o=p.post.comments.map(function(t){return t.id}).indexOf(t);p.post.comments.splice(o,1),p.post.comments_count--})},p.toggleFavorite=function(e){var i=function(){p.post.favorited?(p.post.favorited=!1,p.post.favorites_count--,t.post(p.post.id).one("favorites").remove().then(function(t){p.post.favorited=t.data.status,p.post.favorites_count=t.data.count})):(p.post.favorited=!0,p.post.favorites_count++,t.post(p.post.id).one("favorites").post().then(function(t){p.post.favorited=t.data.status,p.post.favorites_count=t.data.count}))};o.userProfile.authenticated?i():n.signinModal(e).then(function(){i()})},p.toggleTap=function(e){var i=function(){p.post.tapped_into?(p.post.tapped_into=!1,p.post.taps_count--,t.post(p.post.id).one("taps").remove().then(function(t){p.post.tapped_into=t.data.status,p.post.taps_count=t.data.count})):(p.post.tapped_into=!0,p.post.taps_count++,t.post(p.post.id).one("taps").post().then(function(t){p.post.tapped_into=t.data.status,p.post.taps_count=t.data.count}))};o.userProfile.authenticated?i():n.signinModal(e).then(function(){i()})},p.sayAmen=function(e){var i=function(){p.post.amen=!0,p.post.amens_count++,t.post(p.post.id).one("amens").post().then(function(t){p.post.amen=t.data.status,p.post.amens_count=t.data.count})};o.userProfile.authenticated?i():n.signinModal(e).then(function(){i()})},p.shareToFb=function(){s.ui({method:"feed",link:a,picture:a+"/img/testify-fb-share-pic.png",name:"Testify",caption:"Sharing God's goodness",description:p.post.text+" (Tesfify is a community for sharing your testimonies and engaging with other people's testimonies)"},function(t){})},p.deletePost=function(){u.SDeletePost(p.post.id)}}}}]),app.directive("myIcon",["$timeout",function(t){return{restrict:"E",scope:{icon:"@"},replace:!0,link:function(t,e,o){},template:"<i class='mdi mdi-{{::icon}}'></i>"}}]),app.directive("testifyComposer",[function(){return{restrict:"A",templateUrl:"partials/app/testifyComposer.html"}}]);
app.filter("socialCounter",function(){return function(t){return out=t,t&&(t>=999&&999999>t?out=Math.round(t/100)/10+"K":t>=999999&&999999999>t?out=Math.round(t/1e5)/10+"M":t>=999999999&&(out=Math.round(t/1e8)/10+"B")),out}});
app.factory("AppService",["Restangular","Auth","Me",function(e,t,n){var o={posts:[]};t.refreshProfile().then(function(e){});var a=e.service("search"),r=e.all("posts"),i=e.all("categories").getList(),s=e.all("categories").getList({count:!0});return{app:o,search:a,getPosts:r,getCategories:i,getCategoriesWithCount:s}}]),app.factory("Auth",["$http","$localStorage","Restangular","$q","$state","Facebook",function(e,t,n,o,a,i){function s(e){var t=e.replace("-","+").replace("_","/");switch(t.length%4){case 0:break;case 2:t+="==";break;case 3:t+="=";break;default:throw"Illegal base64url string!"}return window.atob(t)}function u(){var e=t.token,n={};if("undefined"!=typeof e){var o=e.split(".")[1];n=JSON.parse(s(o))}return n}var l={authenticated:!1,id:null,hash_id:null,name:"Guest",firstName:"Guest",lastName:"Guest",sex:null,location:null,email:null,avatar:"img/guest.png",profile:null};n.setFullResponse(!0);var c=function(){var e=o.defer();return u().hash_id&&u().exp>Date.now()/1e3?n.one("users",u().hash_id).get({profile:!0}).then(function(t){f(t.data),e.resolve(!0)},function(t){404==t.status&&(v(),g()),e.resolve(!1)}):v(),e.promise},f=function(e){l.authenticated=!0,l.id=e.id,l.hash_id=e.hash_id,l.name=e.first_name+" "+e.last_name,l.firstName=e.first_name,l.lastName=e.last_name,l.username=e.username,l.location=e.location,l.email=e.email,l.avatar=e.avatar,l.profile=e.profile},p=function(e){t.token=e,l.token=e},d=function(e){var t=o.defer();return n.service("signup").post(e).then(function(e){p(e.data.token),c(),a.go("web.app.dashboard.home"),t.resolve(e.data.token)},function(){t.reject()}),t.promise},m=function(e){var t=o.defer();return n.service("authenticate").post(e).then(function(e){p(e.data.token),c(),a.go("web.app.dashboard.home"),t.resolve(e.data.token)},function(){t.reject()}),t.promise},h=function(){var e=o.defer(),t=function(e){var t=o.defer();return r=e,"connected"===r.status?(json={fb_access_token:r.authResponse.accessToken},n.service("fb-token").post(json).then(function(e){p(e.data.token),c(),t.resolve(e)},function(e){t.reject(e)})):t.reject(),t.promise};return i.login(function(n){t(n).then(function(){e.resolve()},function(t){e.reject(t)})}),e.promise},g=function(){tokenClaims={},delete t.token,c(),a.go("web.app.login")},v=function(){l.authenticated=!1,l.id=null,l.hash_id=null,l.name="Guest",l.firstName="Guest",l.lastName="Guest",l.sex=null,l.location=null,l.email=null,l.avatar="img/guest.png"};return{signup:d,signin:m,signinFB:h,logout:g,refreshProfile:c,resetProfile:v,userProfile:l,token:u()}}]),app.factory("Me",["Auth","Restangular","$q",function(e,t,n){var o=e.token.sub,a=t.one("users",o),r=function(e){return t.all("posts").post({post:e.post,anonymous:e.anonymous,categories:e.categories,images:e.images})};return{id:o,me:a,authenticated:e.userProfile.authenticated,favorites:a.all("favorites"),profile:e.userProfile,sendPost:r}}]),app.factory("PostService",["Restangular","$q",function(e,t){var n=(e.all("posts"),function(t){return e.one("posts",t)});return{post:n}}]),app.factory("CommentService",["Restangular","$q",function(e,t){var n=(e.all("comments"),function(t){return e.one("comments",t)});return{comment:n}}]),app.factory("SocialService",["Facebook","Auth",function(e,t){return{}}]),app.factory("UXService",["$mdDialog","$mdToast","Auth","$q","$document",function(e,t,n,o,a){var r=function(t){var n=o.defer();return e.show({controller:"UXModalLoginCtrl",templateUrl:"partials/app/ux.signin.modal.html",parent:document.getElementsByClassName("dialog-holder"),targetEvent:t,clickOutsideToClose:!0}).then(function(e){n.resolve(e)},function(){n.reject()}),n.promise},i=function(t,n){e.show(e.alert().parent(angular.element(document.querySelector("body"))).clickOutsideToClose(!0).title(n).ariaLabel(n).ok("OK").targetEvent(t))},s=function(e){t.show(t.simple().content(e).position("top left").parent(a[0].querySelector("body")).hideDelay(7e3))},u=function(){n.signinFB().then(function(){e.hide(!0)},function(){d="Do nothing"})},l=function(t){n.signin(t).then(function(t){e.hide(!0)},function(e){console.log(e)})};return{signinModal:r,alert:i,toast:s,UXLoginFB:u,UXSubmitLogin:l}}]);
//# sourceMappingURL=../maps/app.js.map
