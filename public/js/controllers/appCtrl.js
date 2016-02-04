app.controller('AppCtrl', function($rootScope, $scope, $mdSidenav, $mdMedia,
  $location, $state, $q, AppService, Auth, Me, appBase, $filter, Pusher, $stateParams) {
  $scope.location = $location;
  $scope.user = Auth.userProfile;
  $scope.composingPost = false;
  $scope.tokHashId = Auth.token.hash_id;
  //$state.go('web.app.login');

  $scope.ui = {
    showSearch: false,
    showSideNav: $state,
    toggleNav: function(which) {
      $mdSidenav(which).toggle();
      //console.log(which);
    },
    toggleSearchBox: function() {
      $scope.ui.showSearch = !$scope.ui.showSearch;
    }
  };
  //console.log($state);
  //$scope.ui.showSideNav = $state.current.data.showSideNav;
  //console.log($scope.tokHashId);
  AppService.getCategoriesWithCount.then(function(cats) {
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
    state: 'web.app.dashboard.home',
    title: 'Feeds',
    icon: 'home',
    condition: true,
    click: ''
  }];

  $scope.menuAuth = [{
    link: 'profile',
    state: "web.app.dashboard.user({id: user.username || user.hash_id})",
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
    state: "web.app.dashboard.user.favorites({id: user.username || user.hash_id})",
    title: 'Favourites',
    icon: 'star',
    condition: 'user.authenticated',
    action: null
  }, {
    link: '',
    state: "web.app.dashboard.user.edit({id: user.username || user.hash_id})",
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

  var getIndexById = function(arr, obj){
    var count = arr.length;
    for(i = 0; i < count; i++){
      if(arr[i].id == obj.id || obj ){
        return i;
      }
    }
    return -1;
  };

  var clearNotifications = function(chat_id){

    var idx = getIndexById($scope.app.messages.notifications, chat_id);
    if(idx >= 0){
      $scope.app.messages.notifications.splice(idx, 1);
    }
    if(!$scope.$$phase){
      $scope.$digest();
    }
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
    var channel = Pusher.subscribe('general');
    channel.bind('my_event', function(data) {
      //alert(data.message);
    });

    var notif_channel = 'private-notifications-'+ Auth.token.hash_id;
    var notifications = Pusher.subscribe(notif_channel);



    notifications.bind('new_message', function(data) {
      //console.log("notif_bind");
      if(checkIfCurrentChat(data.chat)){

      }else{
        var idx = getIndexById($scope.app.messages.notifications, data.chat);
        if(idx == -1){
          $scope.app.messages.notifications.push(data.chat);
        }
        $scope.$digest();
      }

    });

    notifications.bind('pusher:subscription_error', function(status) {
      if(status == 408 || status == 503){
        // retry?
      }
    });
  };

  initPusher();

  //clearNotifications(1);
  $scope.app = {
    messages: {
      notifications: [],
      clearNotifications: clearNotifications
    }
  };



});
