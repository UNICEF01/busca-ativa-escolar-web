(function() {

    angular.module('BuscaAtivaEscolar')
        .config(function($stateProvider) {
            $stateProvider.state('child_viewer.comments', {
                url: '/comments',
                templateUrl: '/views/children/view/comments.html',
                controller: 'ChildCommentsCtrl'
            })
        })
        .controller('ChildCommentsCtrl', function($scope, $stateParams, Children) {

            $scope.Children = Children;

            $scope.comments = {};
            $scope.message = "";

            $scope.refresh = function() {
                $scope.comments = Children.getComments({ id: $stateParams.child_id });
            };

            $scope.sendMessage = function() {

                Children.postComment({
                    id: $scope.$parent.child.id,
                    message: $scope.message
                }, function() {
                    $scope.refresh();
                });

                $scope.message = "";
            };

            $scope.refresh();

        });

})();