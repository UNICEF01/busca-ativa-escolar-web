(function() {
    angular
        .module('BuscaAtivaEscolar')
        .factory('Modals', function($q, $uibModal) {
            return {
                show: function(params) {
                    //console.log('[modals] Show modal: ', params);

                    var def = $q.defer();

                    var instance = $uibModal.open(params);

                    instance.result.then(
                        function(data) {
                            def.resolve(data.response);
                        },
                        function(data) {
                            def.reject(data);
                        }
                    );

                    return def.promise;
                },

                Alert: function(message, details) {
                    return {
                        templateUrl: '/views/modals/alert.html',
                        controller: 'AlertModalCtrl',
                        size: 'sm',
                        resolve: {
                            message: function() {
                                return message;
                            },
                            details: function() {
                                return details;
                            },
                        },
                    };
                },

                Confirm: function(message, details, canDismiss) {
                    var params = {
                        templateUrl: '/views/modals/confirm.html',
                        controller: 'ConfirmModalCtrl',
                        size: 'sm',
                        resolve: {
                            message: function() {
                                return message;
                            },
                            details: function() {
                                return details;
                            },
                            canDismiss: function() {
                                return canDismiss;
                            },
                        },
                    };

                    if (!canDismiss) {
                        params.keyboard = false;
                        params.backdrop = 'static';
                    }

                    return params;
                },

                ConfirmLarge: function(message, details, canDismiss) {
                    var params = {
                        templateUrl: '/views/modals/confirm.html',
                        controller: 'ConfirmLargeModalCtrl',
                        size: 'lg',
                        resolve: {
                            message: function() {
                                return message;
                            },
                            details: function() {
                                return details;
                            },
                            canDismiss: function() {
                                return canDismiss;
                            },
                        },
                    };

                    if (!canDismiss) {
                        params.keyboard = false;
                        params.backdrop = 'static';
                    }

                    return params;
                },

                ConfirmEmail: function(message, details, schools, canDismiss) {
                    var params = {
                        templateUrl: '/views/modals/confirm_email.html',
                        controller: 'ConfirmEmailModalCtrl',
                        size: 'lg',
                        resolve: {
                            message: function() {
                                return message;
                            },
                            details: function() {
                                return details;
                            },
                            schools: function() {
                                return schools;
                            },
                            canDismiss: function() {
                                return canDismiss;
                            },
                        },
                    };

                    if (!canDismiss) {
                        params.keyboard = false;
                        params.backdrop = 'static';
                    }

                    return params;
                },

                GeneralAlerts: function(message, canDismiss) {
                    var params = {
                        templateUrl: '/views/modals/general.html',
                        controller: 'GeneralAlertsModalCtrl',
                        size: 'lg',
                        resolve: {
                            message: function() {
                                return message;
                            },
                            canDismiss: function() {
                                return canDismiss;
                            },
                        },
                    };

                    if (!canDismiss) {
                        params.keyboard = false;
                        params.backdrop = 'static';
                    }

                    return params;
                },

                /**
                 * Função do pop-up após o login.
                 * @param {*} message
                 * @param {*} canDismiss
                 * @returns
                 */
                GeneralPopUpAlerts: function(message, canDismiss) {
                    var params = {
                        templateUrl: '/views/modals/add_popup_search.html',
                        controller: 'GeneralAlertsModalCtrl',
                        size: 'md',
                        resolve: {
                            message: function() {
                                return message;
                            },
                            canDismiss: function() {
                                return canDismiss;
                            },
                        },
                    };

                    if (!canDismiss) {
                        params.keyboard = false;
                        params.backdrop = 'static';
                    }

                    return params;
                },

                Prompt: function(
                    question,
                    defaultAnswer,
                    canDismiss,
                    answerPlaceholder
                ) {
                    var params = {
                        templateUrl: '/views/modals/prompt.html',
                        controller: 'PromptModalCtrl',
                        size: 'md',
                        resolve: {
                            question: function() {
                                return question;
                            },
                            defaultAnswer: function() {
                                return defaultAnswer;
                            },
                            canDismiss: function() {
                                return canDismiss;
                            },
                            answerPlaceholder: function() {
                                return answerPlaceholder;
                            },
                        },
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
                        resolve: {},
                    };

                    return params;
                },

                Login: function(reason, canDismiss) {
                    var params = {
                        templateUrl: '/views/modals/login.html',
                        controller: 'LoginModalCtrl',
                        size: 'md',
                        resolve: {
                            reason: function() {
                                return reason;
                            },
                            canDismiss: function() {
                                return canDismiss;
                            },
                        },
                    };

                    if (!canDismiss) {
                        params.keyboard = false;
                        params.backdrop = 'static';
                    }

                    return params;
                },
                UserPicker: function(
                    title,
                    message,
                    canDismiss,
                    noUsersMessage
                ) {
                    var params = {
                        templateUrl: '/views/modals/user_picker.html',
                        controller: 'UserPickerModalCtrl',
                        size: 'md',
                        resolve: {
                            title: function() {
                                return title;
                            },
                            message: function() {
                                return message;
                            },
                            noUsersMessage: function() {
                                return noUsersMessage;
                            },
                            canDismiss: function() {
                                return canDismiss;
                            }
                        },
                    };

                    if (!canDismiss) {
                        params.keyboard = false;
                        params.backdrop = 'static';
                    }

                    return params;
                },

                GroupPicker: function(
                    title,
                    message,
                    filter,
                    initialGroup,
                    canDismiss,
                    noGroupsMessage
                ) {
                    var params = {
                        templateUrl: '/views/modals/group_picker.html',
                        controller: 'GroupPickerModalCtrl',
                        size: 'lg',
                        resolve: {
                            title: function() {
                                return title;
                            },
                            message: function() {
                                return message;
                            },
                            filter: function() {
                                return filter;
                            },
                            initialGroup: function() {
                                return initialGroup;
                            },
                            noGroupsMessage: function() {
                                return noGroupsMessage;
                            },
                            canDismiss: function() {
                                return canDismiss;
                            },
                        },
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
                        size: 'md',
                    };
                },

                FileUploader: function(title, message, uploadUrl, uploadParameters) {
                    return {
                        templateUrl: '/views/modals/file_uploader.html',
                        controller: 'FileUploaderModalCtrl',
                        size: 'md',
                        resolve: {
                            title: function() {
                                return title;
                            },
                            message: function() {
                                return message;
                            },
                            uploadUrl: function() {
                                return uploadUrl;
                            },
                            uploadParameters: function() {
                                return uploadParameters;
                            },
                        },
                    };
                },

                FileUploaderTitulo: function(
                    title,
                    message,
                    uploadUrl,
                    uploadParameters
                ) {
                    return {
                        templateUrl: '/views/modals/file_uploader_titulo.html',
                        controller: 'FileUploaderTituloModalCtrl',
                        size: 'md',
                        resolve: {
                            title: function() {
                                return title;
                            },
                            message: function() {
                                return message;
                            },
                            uploadUrl: function() {
                                return uploadUrl;
                            },
                            uploadParameters: function() {
                                return uploadParameters;
                            },
                        },
                    };
                },

                DownloadLink: function(title, message, href) {
                    return {
                        templateUrl: '/views/modals/download_link.html',
                        controller: 'DownloadLinkModalCtrl',
                        size: 'md',
                        resolve: {
                            title: function() {
                                return title;
                            },
                            message: function() {
                                return message;
                            },
                            href: function() {
                                return href;
                            },
                        },
                    };
                },

                CaseReopen: function($typeUser) {
                    var params = {
                        templateUrl: '/views/modals/case_reopen.html',
                        controller: 'CaseReopenModalCtrl',
                        size: 'md',
                        resolve: {
                            $typeUser: function() {
                                return $typeUser;
                            },
                        },
                    };

                    return params;
                },

                CaseTransfer: function($typeUser) {
                    var params = {
                        templateUrl: '/views/modals/case_transfer.html',
                        controller: 'CaseTransferModalCtrl',
                        size: 'md',
                        resolve: {
                            $typeUser: function() {
                                return $typeUser;
                            },
                        },
                    };

                    return params;
                },

                CaseReject: function($typeUser) {
                    var params = {
                        templateUrl: '/views/modals/case_reject.html',
                        controller: 'CaseRejectModalCtrl',
                        size: 'md',
                        resolve: {
                            $typeUser: function() {
                                return $typeUser;
                            },
                        },
                    };

                    return params;
                },

                CaseActivityLogEntry: function() {
                    var params = {
                        templateUrl: '/views/modals/case_activity_log_entry.html',
                        controller: 'CaseActivityLogEntryCtrl',
                        size: 'md',
                        resolve: {},
                    };

                    //if (!canDismiss) {
                    //params.keyboard = false;
                    //params.backdrop = 'static';
                    //}

                    return params;
                },

                AddPeriodFrequency: function(
                    message,
                    subtitle,
                    clazz,
                    period,
                    canDismiss
                ) {
                    var params = {
                        templateUrl: '/views/modals/add_period_frequency.html',
                        controller: 'AddPeriodFrequencyModalCtrl',
                        size: 'md',
                        resolve: {
                            message: function() {
                                return message;
                            },
                            subtitle: function() {
                                return subtitle;
                            },
                            clazz: function() {
                                return clazz;
                            },
                            period: function() {
                                return period;
                            },
                            canDismiss: function() {
                                return canDismiss;
                            },
                        },
                    };

                    if (!canDismiss) {
                        params.keyboard = false;
                        params.backdrop = 'static';
                    }

                    return params;
                },
            };
        });
})();