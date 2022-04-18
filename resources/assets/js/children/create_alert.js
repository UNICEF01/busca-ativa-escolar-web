(function() {

    angular.module('BuscaAtivaEscolar')
        .config(function($stateProvider) {
            $stateProvider.state('child_create_from_alert', {
                url: '/children/create_alert',
                templateUrl: '/views/children/create_alert.html',
                controller: 'CreateAlertCtrl'
            })
        })
        .controller('CreateAlertCtrl', function($scope, $state, ngToast, Utils, Identity, StaticData, Children, Cities, Platform, Modals) {

            $scope.static = StaticData;
            $scope.disableCreateAlertButton = false;

            $scope.selectedGroup = {};

            $scope.birthdayDateEnd = moment(new Date()).format('YYYY-MM-DD');
            $scope.birthdayDateStart = moment($scope.birthdayDateEnd).subtract(100, 'years').format('YYYY-MM-DD');

            $scope.alert = {};

            $scope.fetchCities = function(query) {
                var data = { name: query, $hide_loading_feedback: true };
                if ($scope.alert.place_uf) data.uf = $scope.alert.place_uf;
                return Cities.search(data).$promise.then(function(res) {
                    return res.results;
                });
            };

            $scope.renderSelectedCity = function(city) {
                if (!city) return '';
                return city.uf + ' / ' + city.name;
            };

            $scope.createAlert = function() {
                $scope.disableCreateAlertButton = true;
                var data = $scope.alert;
                data = Utils.prepareDateFields(data, ['dob']);
                data.place_city_id = data.place_city ? data.place_city.id : null;
                data.place_city_name = data.place_city ? data.place_city.name : null;
                data.group_id = $scope.selectedGroup.id;
                Children.spawnFromAlert(data).$promise.then(function(res) {
                    if (res.messages) {
                        console.warn("[create_alert] Failed validation: ", res.messages);
                        $scope.disableCreateAlertButton = false;
                        return Utils.displayValidationErrors(res);
                    }

                    if (!res || !res.child_id) {
                        ngToast.danger('Ocorreu um erro ao registrar o alerta!');
                        $scope.disableCreateAlertButton = false;
                        return;
                    }

                    ngToast.success('Alerta registrado com sucesso!');

                    $scope.disableCreateAlertButton = false;

                    if (Identity.getType() === 'agente_comunitario') {
                        $state.go('dashboard');
                        return;
                    }

                    $state.go('child_viewer', { child_id: res.child_id });
                });
            };

            $scope.changeGroup = function() {
                Modals.show(
                    Modals.GroupPicker(
                        'Atribuir grupo ao alerta',
                        'O último grupo selecionado será atribuído ao alerta.',
                        { id: Identity.getCurrentUser().tenant.primary_group_id, name: Identity.getCurrentUser().tenant.primary_group_name },
                        'Atribuindo grupo: ',
                        false,
                        null,
                        null,
                        true,
                        'Nenhum grupo selecionado.')
                ).then(function(selectedGroup) {
                    $scope.selectedGroup = selectedGroup;
                }).then(function(res) {

                });
            };

            Platform.whenReady(function() {
                $scope.selectedGroup = Identity.getCurrentUser().group;
            });

        });

})();