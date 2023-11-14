(function () {

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('school_browser', {
                url: '/schools',
                templateUrl: '/views/schools/school_browser.html',
                controller: 'SchoolBrowserCtrl'
            });
        })
        .controller('SchoolBrowserCtrl', function ($scope, Schools, ngToast, $state, Modals, Identity, Config, Ufs, Platform) {

            $scope.check_all_schools = false;
            $scope.identity = Identity;
            $scope.schools = {};
            $scope.msg_success = false;
            $scope.msg_error = false;
            $scope.avaliable_years_educacenso = [];
            $scope.query = {
                year_educacenso: new Date().getFullYear(),
                city_uf: '',
                sort: {},
                show_suspended: false,
                max: 5,
                page: 1
            };
            $scope.selected = {
                schools: []
            };

            $scope.onCheckSelectAll = function () {
                if ($scope.check_all_schools) {
                    $scope.selected.schools = angular.copy($scope.schools.data);
                } else {
                    $scope.selected.schools = [];
                }
            };

            $scope.onModifySchool = function (school) {
                Schools.update(school).$promise.then($scope.onSaved);
            };

            $scope.onSaved = function (res) {
                if (res.status === "ok") {
                    ngToast.success("Dados da escola " + res.updated.name + " salvos com sucesso!");
                    return;
                } else {
                    ngToast.danger("Ocorreu um erro ao salvar a escola!: " + res.message, res.status);
                    $scope.refresh();
                }
            };

            $scope.sendnotification = function () {

                //remove objects without email
                var schools_to_send_notification = $scope.selected.schools.filter(function (school) {
                    if (school.school_email != null && school.school_email != "") {
                        return true;
                    } else {
                        return false;
                    }
                });

                if (schools_to_send_notification.length > 0) {

                    Modals.show(
                        Modals.ConfirmEmail(
                            'Confirma o envio do email para as seguintes escolas?',
                            'Ao confirmar, as escolas serão notificadas por email e poderão cadastrar o endereço das crianças e adolescentes reportadas pelo Educacenso',
                            schools_to_send_notification
                        )).then(function () {
                            return Schools.send_educacenso_notifications(schools_to_send_notification).$promise;
                        })
                        .then(function (res) {
                            if (res.status == "error") {
                                ngToast.danger(res.message);
                                $scope.msg_success = false;
                                $scope.msg_error = true;
                                $scope.refresh();
                                window.scrollTo(0, 0);
                            } else {
                                ngToast.warning(res.message);
                                $scope.msg_success = true;
                                $scope.msg_error = false;
                                $scope.refresh();
                                window.scrollTo(0, 0);
                            }
                        });
                } else {
                    Modals.show(Modals.Alert('Atenção', 'Selecione as escolas para as quais deseja encaminhar o email'));
                }

            };

            $scope.onSelectYear = function () {
                $scope.query.page = 1;
                $scope.query.max = 5;
                $scope.query.city_uf = '';
                $scope.refresh();
            };

            $scope.onSelectCity = function () {
                $scope.query.page = 1;
                $scope.query.max = 5;
                $scope.refresh();
            };

            $scope.refresh = function () {
                Schools.all_educacenso($scope.query, function (res) {
                    $scope.check_all_schools = false;
                    $scope.selected.schools = [];
                    $scope.schools = angular.copy(res);
                });
            };

            $scope.setMaxResults = function (max) {
                $scope.query.max = max;
                $scope.query.page = 1;
                $scope.refresh();
            };

            $scope.getYears = function () {
                const currentYear = new Date().getFullYear();
                const startYear = 2017;
                const years = [];
                for (let year = startYear; year <= currentYear; year++) {
                    years.push(year);
                }
                return years;
            }

            Platform.whenReady(function () {
                //criando a lista dos anos possíveis para seleção
                $scope.avaliable_years_educacenso = $scope.getYears();
                $scope.refresh();
            });



        });

})();