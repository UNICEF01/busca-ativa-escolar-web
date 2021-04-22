(function () {

    angular.module('BuscaAtivaEscolar').directive('appNavbar', function ($localStorage, $location, $state, Identity, StaticData, Notifications, Platform, Auth, Children) {

        function init(scope, element, attrs) {

            scope.identity = Identity;
            scope.auth = Auth;
            scope.notifications = Notifications;
            scope.pending_requests = 0;

            scope.showNotifications = true;

            scope.location = $location.url();
            scope.state = window.location.pathname;


            scope.isHidden = function () {
                return !!Platform.getFlag('HIDE_NAVBAR');
            };

            scope.renderTenantName = function () {
                if (Identity.getCurrentUser().tenant) return Identity.getCurrentUser().tenant.name;
                if (Identity.getCurrentUser().uf) return StaticData.getCurrentUF().name;
                return '';
            };

            scope.onMenuToggle = function (isOpen) {
                if (isOpen) Notifications.refresh();
            };

            scope.toggleNotifications = function ($event) {
                scope.showNotifications = !scope.showNotifications;

                $event.stopPropagation();
                $event.stopImmediatePropagation();
                $event.preventDefault();

                return false;
            };

            if(Identity.isLoggedIn()) {

                if( Identity.isUserType("supervisor_institucional") || Identity.isUserType("coordenador_operacional") ) {

                    Children.requests().$promise.then(function (value) {
                        value.data.forEach(function (request) {
                            if (Identity.isUserType("supervisor_institucional") && Identity.getCurrentUserID() === request.requester_id && request.status === "requested") {
                                scope.pending_requests += 1;
                            }
                            if (Identity.isUserType("coordenador_operacional") && request.status == "requested") {
                                scope.pending_requests += 1;
                            }
                        });
                    });
                }
            }

            Platform.whenReady(function () {
                //verify signature LGPD
                if (!Identity.getCurrentUser().lgpd) {
                    return $state.go('lgpd_signup', {id: Identity.getCurrentUser().id});
                }
            });

        }

        return {
            link: init,
            replace: true,
            templateUrl: '/views/navbar.html'
        };
    });

})();