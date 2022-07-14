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
            function($scope, $stateParams, Children, Identity) {
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

                $scope.sendNotification = function(messsage) {
                    /*let teste = messsage.message;
                                        console.log(teste);*/
                    Children.postNotification({
                            tenant_id: $scope.$parent.child.tenant_id,
                            user_id: Identity.getCurrentUser().id,
                            children_case_id: $scope.$parent.child.current_case_id,
                            notification: messsage.message,
                        },
                        function() {
                            $scope.refresh();
                        }
                    );

                    $scope.message = "";
                };

                $scope.refresh();
            }
        );
})();