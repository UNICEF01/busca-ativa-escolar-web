(function() {

    angular.module('BuscaAtivaEscolar')
        .config(function($stateProvider) {
            $stateProvider.state('user_notifications', {
                url: '/user_notifications',
                templateUrl: '/views/children/user_notifications.html',
                controller: 'UserNotificationsCtrlCtrl'
            })
        })
        .controller('UserNotificationsCtrlCtrl', function() {});
})();