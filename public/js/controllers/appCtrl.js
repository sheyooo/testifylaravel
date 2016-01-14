app.controller('AppCtrl', function($rootScope, $scope, $mdSidenav, $mdMedia, $location, $state, $q, AppService, Auth, Me, appBase) {
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

    AppService.getCategories.then(function(cats) {

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
        state: "web.app.dashboard.user({hash_id: tokHashId})",
        title: 'Profile',
        icon: 'account',
        condition: 'user.authenticated',
        action: null
    }, {
        link: '',
        state: 'web.app.dashboard.home',
        title: 'Messages',
        icon: 'message-text-outline',
        condition: 'user.authenticated',
        click: ''
    }, {
        link: 'showListBottomSheet($event)',
        state: 'web.app.dashboard.user.favorites({hash_id: tokHashId})',
        title: 'Favourites',
        icon: 'star',
        condition: 'user.authenticated',
        action: null
    }, {
        link: 'showListBottomSheet($event)',
        state: 'web.app.dashboard.settings',
        title: 'Settings',
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

});
