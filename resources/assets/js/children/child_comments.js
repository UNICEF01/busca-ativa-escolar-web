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
                $scope.check = true;

                $scope.refresh = function(value) {
                    if (value == true) $scope.check = false;
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

                $scope.checkComment = function(id) {
                    $scope.comments = Children.checkComment({
                        comment_id: id,
                    }).$promise.then(function(value) {
                        if (value.data == null) $scope.check = true;
                        else $scope.check = false;
                    });
                };

                $scope.sendNotification = function(message) {
                    $scope.checkComment(message.id);
                    console.log($scope.check);
                    if ($scope.check == true) {
                        Children.postNotification({
                                tenant_id: $scope.$parent.child.tenant_id,
                                user_id: Identity.getCurrentUser().id,
                                comment_id: message.id,
                                children_case_id: $scope.$parent.child.current_case_id,
                                notification: message.message,
                            },
                            function() {
                                $scope.refresh(true);
                            }
                        );

                        $scope.message = "";
                    }
                };

                $scope.refresh();
            }
        );
})();