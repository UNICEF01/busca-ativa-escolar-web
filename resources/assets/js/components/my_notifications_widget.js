(function() {
    angular
        .module("BuscaAtivaEscolar")
        .directive("myNotifications", function(Platform, Children) {
            var notifications = [];
            var isReady = false;

            function refresh() {
                Children.getNotification({}, function(data) {
                    notifications = [data.data];
                    isReady = true;
                });
            }

            function init(scope) {
                scope.getNotifications = function() {
                    return notifications[0];
                };

                scope.isReady = function() {
                    return isReady;
                };

                scope.hasNotifications = function() {
                    return notifications && notifications.length > 0;
                };

                scope.solveNotification = function(id) {
                    Children.solvetNotification({ id: id }, function(data) {
                        notifications = [data.data];
                        isReady = true;
                        refresh();
                    });
                };

                Platform.whenReady(function() {
                    refresh();
                });
            }

            return {
                link: init,
                replace: true,
                templateUrl: "/views/components/my_notifications.html",
            };
        });
})();