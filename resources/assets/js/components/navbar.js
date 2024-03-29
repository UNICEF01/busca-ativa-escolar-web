(function () {
  angular
    .module('BuscaAtivaEscolar')
    .directive(
      'appNavbar',
      function (
        $location,
        $state,
        Identity,
        StaticData,
        Platform,
        Auth,
        Children
      ) {
        function init(scope) {
          scope.identity = Identity;
          scope.auth = Auth;
          scope.pending_requests = 0;

          scope.location = $location.url();
          scope.state = window.location.pathname;

          scope.isHidden = function () {
            return !!Platform.getFlag('HIDE_NAVBAR');
          };

          scope.renderTenantName = function () {
            if (Identity.getCurrentUser().tenant)
              return Identity.getCurrentUser().tenant.name;
            if (Identity.getCurrentUser().uf)
              return StaticData.getCurrentUF().name;
            return '';
          };

          if (Identity.isLoggedIn()) {
            if (
              Identity.isUserType('supervisor_institucional') ||
              Identity.isUserType('coordenador_operacional')
            ) {
              Children.requests().$promise.then(function (value) {
                value.data.forEach(function (request) {
                  if (
                    Identity.isUserType('supervisor_institucional') &&
                    Identity.getCurrentUserID() === request.requester_id &&
                    request.status === 'requested'
                  ) {
                    scope.pending_requests += 1;
                  }
                  if (
                    Identity.isUserType('coordenador_operacional') &&
                    request.status == 'requested'
                  ) {
                    scope.pending_requests += 1;
                  }
                });
              });
            }
          }

          Platform.whenReady(function () {
            //verify signature LGPD
            if (!Identity.getCurrentUser().lgpd) {
              return $state.go('lgpd_signup', {
                id: Identity.getCurrentUser().id,
              });
            }
          });

          scope.canSeeConfigPage = function () {
            if (
              (scope.identity.can('settings.manage') ||
                scope.identity.can('groups.manage') ||
                scope.identity.manageImports()) &&
              scope.identity.getCurrentUser().tenant_id &&
              scope.identity.getCurrentUser().group.is_primary
            ) {
              return true;
            }
            return false;
          };
        }

        return {
          link: init,
          replace: true,
          templateUrl: '/views/navbar.html',
        };
      }
    );
})();
