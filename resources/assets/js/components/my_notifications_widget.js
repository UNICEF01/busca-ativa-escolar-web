(function() {

    angular.module('BuscaAtivaEscolar').directive('myNotifications', function(Platform, Alerts) {

        var alerts = [];
        var isReady = false;

        function refresh() {
            Alerts.mine({}, function(data) {
                alerts = data.data;
                isReady = true;
            });
        }

        function init(scope) {

            scope.getAlerts = function() {
                return alerts;
            };
            
            scope.isReady = function() {
                return isReady;
            };

            scope.hasAlerts = function() {
                return (alerts && alerts.length > 0);
            };

            Platform.whenReady(function() {
                refresh();
            });
        }

        return {
            link: init,
            replace: true,
            templateUrl: '/views/components/my_notifications.html'
        };
    });

})();