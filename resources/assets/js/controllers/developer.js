(function () {
  angular
    .module('BuscaAtivaEscolar')
    .controller(
      'DeveloperCtrl',
      function (
        $scope,
        $localStorage,
        $http,
        StaticData,
        ngToast,
        API,
        Tenants,
        Children,
        Auth
      ) {
        $scope.static = StaticData;

        var messages = [
          'asdasd asd as das das dsd fasdf as',
          'sdg sdf gfdgh dfthdfg hdfgh dfgh ',
          'rtye rtertg heriufh iurfaisug faisugf as',
          'ksjf hkdsuf oiaweua bfieubf iasuef iauegh',
          'jkb viubiurbviesubvisueb iseubv',
          'askjdfh aiufeiuab biausf biu iubfa iub fseiuse bfsaef',
        ];

        var child_id = 'b9d1d8a0-ce23-11e6-98e6-1dc1d3126c4e';
        var tenant_id = 'b0838f00-cd55-11e6-b19b-757d3a457db3';

        $scope.rest = {
          requireAuth: true,
          endpoint: null,
          request: '{}',
          response: '{}',
          sendRequest: sendRESTRequest,
        };

        function sendRESTRequest() {
          var headers = $scope.rest.requireAuth ? API.REQUIRE_AUTH : {};
          var request = {
            method: $scope.rest.endpoint.method,
            url: API.getURI($scope.rest.endpoint.path, true),
            data: JSON.parse($scope.rest.request),
            headers: headers,
            responseType: 'string',
          };

          console.info('[developer.rest] Sending request: ', request);

          $http(request).then(
            function (res) {
              ngToast.success('REST OK: ' + res.status);
              $scope.rest.response = res.data;
            },
            function (err) {
              ngToast.danger('REST ERROR: ' + err.status);
            }
          );
        }

        $scope.storage = $localStorage;

        $scope.login = function () {
          Auth.requireLogin();
        };

        $scope.logout = function () {
          Auth.logout();
        };

        $scope.testGetTenant = function () {
          $scope.tenant = Tenants.get({ id: tenant_id });
        };

        $scope.testGetChildren = function () {
          $scope.child = Children.get({ id: child_id });
        };
      }
    );
})();
