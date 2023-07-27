(function() {
    angular
        .module("BuscaAtivaEscolar")
        .config(function($stateProvider) {
            $stateProvider.state("child_viewer.comments", {
                url: "/comments",
                templateUrl: "/views/children/view/comments.html",
                controller: "ChildCommentsCtrl",
            });
        })
        .controller(
            "ChildCommentsCtrl",
            function($scope, $stateParams, Children, Identity, Modals) {
                $scope.Children = Children;
                $scope.comments = {};
                $scope.message = "";

                $scope.refresh = function() {
                    $scope.comments = Children.getComments({ id: $stateParams.child_id });
                };

                $scope.logged = Identity.getCurrentUser().id;

                $scope.sendMessage = function() {
                    Children.postComment({
                            id: $scope.$parent.child.id,
                            message: $scope.message,
                        },
                        function() {
                            $scope.refresh();
                        }
                    );
                    $scope.message = "";
                };

                $scope.sendNotification = function(message) {

                    Modals.show(

                        Modals.Confirm(
                            'Confirma o envio da notificação?',
                            'Ela será encaminhada para os coordenadores/supervisores do grupo superior ao seu.'
                        )).then(function() {

                        Children.postNotification({
                                tenant_id: $scope.$parent.child.tenant_id,
                                user_id: Identity.getCurrentUser().id,
                                comment_id: message.id,
                                children_case_id: $scope.$parent.child.current_case_id,
                                notification: message.message,
                            },
                            function() {
                                $scope.refresh();
                            }
                        );

                        $scope.message = "";
                    });

                };
                $scope.refresh();
            }
        );
})();