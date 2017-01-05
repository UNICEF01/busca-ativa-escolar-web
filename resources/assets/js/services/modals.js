(function() {

	angular
		.module('BuscaAtivaEscolar')
		.factory('Modals', function($q, $uibModal) {

			return {

				show: function(params) {

					var def = $q.defer();

					var instance = $uibModal.open(params);

					instance.result.then(function (data) {
						def.resolve(data.response);
					}, function (data) {
						def.reject(data);
					});

					return def.promise;
				},


				Alert: function(message, details) {
					return {
						templateUrl: '/modals/alert.html',
						controller: 'AlertModalCtrl',
						size: 'sm',
						resolve: {
							message: function() { return message; },
							details: function() { return details; }
						}
					};
				},

				Confirm: function(message, details, canDismiss) {
					var params = {
						templateUrl: '/modals/confirm.html',
						controller: 'ConfirmModalCtrl',
						size: 'sm',
						resolve: {
							message: function() { return message; },
							details: function() { return details; },
							canDismiss: function() { return canDismiss; }
						}
					};

					if (!canDismiss) {
						params.keyboard = false;
						params.backdrop = 'static';
					}

					return params;
				},

				ConfirmSelect: function(message, details, list, canDismiss) {
					var params = {
						templateUrl: '/modals/confirm_select.html',
						controller: 'ConfirmSelectModalCtrl',
						size: 'md',
						resolve: {
							message: function() { return message; },
							details: function() { return details; },
							list: function() { return list; },
							canDismiss: function() { return canDismiss; }
						}
					};


					if (!canDismiss) {
						params.keyboard = false;
						params.backdrop = 'static';
					}

					return params;
				},
				
				Prompt: function(question, defaultAnswer, canDismiss) {
					var params = {
						templateUrl: '/modals/prompt.html',
						controller: 'PromptModalCtrl',
						size: 'md',
						resolve: {
							question: function() { return question; },
							defaultAnswer: function() { return defaultAnswer; },
							canDismiss: function() { return canDismiss; }
						}
					};

					if (!canDismiss) {
						params.keyboard = false;
						params.backdrop = 'static';
					}

					return params;
				},

				UserPicker: function(title, message, canDismiss) {
					var params = {
						templateUrl: '/modals/user_picker.html',
						controller: 'UserPickerModalCtrl',
						size: 'md',
						resolve: {
							title: function() { return title; },
							message: function() { return message; },
							canDismiss: function() { return canDismiss; }
						}
					};

					if (!canDismiss) {
						params.keyboard = false;
						params.backdrop = 'static';
					}

					return params;
				},

				CaseRestart: function() {
					var params = {
						templateUrl: '/modals/case_restart.html',
						controller: 'CaseRestartModalCtrl',
						size: 'md',
						resolve: {

						}
					};

					return params;
				},

				CaseActivityLogEntry: function() {
					var params = {
						templateUrl: '/modals/case_activity_log_entry.html',
						controller: 'CaseActivityLogEntryCtrl',
						size: 'md',
						resolve: {

						}
					};

					//if (!canDismiss) {
						//params.keyboard = false;
						//params.backdrop = 'static';
					//}

					return params;
				}

			}
		});
})();