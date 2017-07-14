(function() {

	angular
		.module('BuscaAtivaEscolar')
		.factory('Modals', function($q, $uibModal) {

			return {

				show: function(params) {

					console.log('[modals] Show modal: ', params);

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
						templateUrl: '/views/modals/alert.html',
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
						templateUrl: '/views/modals/confirm.html',
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

				Prompt: function(question, defaultAnswer, canDismiss, answerPlaceholder) {
					var params = {
						templateUrl: '/views/modals/prompt.html',
						controller: 'PromptModalCtrl',
						size: 'md',
						resolve: {
							question: function() { return question; },
							defaultAnswer: function() { return defaultAnswer; },
							canDismiss: function() { return canDismiss; },
							answerPlaceholder: function() { return answerPlaceholder; }
						}
					};

					if (!canDismiss) {
						params.keyboard = false;
						params.backdrop = 'static';
					}

					return params;
				},

				NewSupportTicketModal: function() {
					var params = {
						templateUrl: '/views/modals/new_support_ticket.html',
						controller: 'NewSupportTicketModalCtrl',
						size: 'md',
						resolve: {}
					};

					return params;
				},

				Login: function(reason, canDismiss) {
					var params = {
						templateUrl: '/views/modals/login.html',
						controller: 'LoginModalCtrl',
						size: 'md',
						resolve: {
							reason: function() { return reason; },
							canDismiss: function() { return canDismiss; }
						}
					};

					if (!canDismiss) {
						params.keyboard = false;
						params.backdrop = 'static';
					}

					return params;
				},

				UserPicker: function(title, message, users, canDismiss, noUsersMessage) {
					var params = {
						templateUrl: '/views/modals/user_picker.html',
						controller: 'UserPickerModalCtrl',
						size: 'md',
						resolve: {
							title: function() { return title; },
							message: function() { return message; },
							noUsersMessage: function() { return noUsersMessage; },
							users: function() { return users; },
							canDismiss: function() { return canDismiss; }
						}
					};

					if (!canDismiss) {
						params.keyboard = false;
						params.backdrop = 'static';
					}

					return params;
				},

				CaseCancel: function() {
					return {
						templateUrl: '/views/modals/case_cancel.html',
						controller: 'CaseCancelModalCtrl',
						size: 'md'
					};
				},

				FileUploader: function(title, message, uploadUrl, uploadParameters) {
					return {
						templateUrl: '/views/modals/file_uploader.html',
						controller: 'FileUploaderModalCtrl',
						size: 'md',
						resolve: {
							title: function() { return title; },
							message: function() { return message; },
							uploadUrl: function() { return uploadUrl; },
							uploadParameters: function() { return uploadParameters; },
						}
					};
				},

				CaseRestart: function() {
					var params = {
						templateUrl: '/views/modals/case_restart.html',
						controller: 'CaseRestartModalCtrl',
						size: 'md',
						resolve: {

						}
					};

					return params;
				},

				CaseActivityLogEntry: function() {
					var params = {
						templateUrl: '/views/modals/case_activity_log_entry.html',
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