(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('child_viewer.comments', {
				url: '/comments',
				templateUrl: '/views/children/view/comments.html',
				controller: 'ChildCommentsCtrl'
			})
		})
		.controller('ChildCommentsCtrl', function ($scope, $state, $stateParams, Children, $localStorage, Modals, ngToast) {

			$scope.Children = Children;

			$scope.comments = {};
            $scope.id_message = null;
            $scope.message = "";
			$scope.current_user = {};

            $scope.message_edit

			$scope.refresh = function() {
				$scope.comments = Children.getComments({id: $stateParams.child_id});
				$scope.current_user = $localStorage.identity.current_user;
			};

			$scope.sendMessage = function() {

				if($scope.id_message == null){

					Children.postComment({
                        id: $scope.$parent.child.id,
                        message: $scope.message,
                    }, function (res) {

						if(res && res.status === 'ok') {
                            ngToast.success('Anotação cadastrada com sucesso!');
                            $scope.refresh();
                            return;
                        }

                        ngToast.danger('Ocorreu um erro ao cadastrar a anotação!');
                        console.error("[comments.removeComment] Failed to remoev comment: ", res);

                        $scope.id_message = null;
                        $scope.message = "";

                    });

				}else{

                    Children.updateComment({
                        id: $scope.$parent.child.id,
                        message: $scope.message,
                        id_message: $scope.id_message
                    }, function (res) {

                        if(res && res.status === 'ok') {
                            ngToast.success('Anotação editada com sucesso!');
                            $scope.refresh();
                            return;
                        }

                        ngToast.danger('Ocorreu um erro ao editar a anotação!');
                        console.error("[comments.removeComment] Failed to remoev comment: ", res);

                        $scope.id_message = null;
                        $scope.message = "";

                    });

				}

				$scope.message = "";
                $scope.id_message = null;
			};

			$scope.removeComment = function (comment) {

                Modals.show(
                    Modals.Confirm(
                        'Tem certeza que deseja remover a anotação?'
                    ))
                    .then(function () {
                        return Children.removeComment({child_id: $stateParams.child_id, comment_id: comment.id}).$promise;
                    })
                    .then(function (res) {
                        if(res && res.status === 'ok') {
                            ngToast.success('Anotação removida com sucesso!');
                            $scope.refresh();
                            return;
                        }

                        ngToast.danger('Ocorreu um erro ao remover a anotação!');
                        console.error("[comments.removeComment] Failed to remoev comment: ", res);

                        $scope.message = "";
                        $scope.id_message = null;
                    })
            };

            $scope.editComment = function (comment) {
                var result = Children.getComment({child_id: $stateParams.child_id, comment_id: comment.id}).$promise;
                result.then( function (result) {
					$scope.id_message = result.id;
                    $scope.message = result.message;
                    document.getElementById("fld-register-comment").focus();
                });
			};

			console.log("[core] @ChildCommentsCtrl", $stateParams);

			$scope.refresh();

		});

})();