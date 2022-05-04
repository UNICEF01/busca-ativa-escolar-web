(function() {

    angular.module('BuscaAtivaEscolar')
        .service('Notifications', function($interval, $location, $rootScope, ngToast, Auth, Identity, Config, UserNotifications) {

            var notifications = [];
            var seenNotifications = [];
            var isBusy = false;

            function refresh(isFirstRefresh) {

                if (!Identity.isLoggedIn()) return;
                if (Auth.isRefreshExpired()) return;
                if (!Identity.can('notifications')) return;

                isBusy = true;

                UserNotifications.getUnread({ $hide_loading_feedback: true }, function(res) {
                    notifications = res.data;
                    isBusy = false;
                    setTimeout(emitToastsOnNewNotifications(isFirstRefresh), 60000);
                });
            }

            function setup() {
                refresh(true);

                $interval(checkForNewNotifications, Config.NOTIFICATIONS_REFRESH_INTERVAL);

                $rootScope.$on('auth.logged_in', function() {
                    notifications = [];
                    seenNotifications = [];

                    refresh(true);
                });

                $rootScope.$on('auth.logged_out', function() {
                    notifications = [];
                    seenNotifications = [];
                });
            }

            function checkForNewNotifications() {
                refresh(false);
            }

            function emitToastsOnNewNotifications(isFirstRefresh) {

                if (!notifications) return;

                for (var i in notifications) {
                    if (!notifications.hasOwnProperty(i)) continue;
                    if (seenNotifications.indexOf(notifications[i].id) !== -1) continue;

                    seenNotifications.push(notifications[i].id);

                    if (isFirstRefresh) continue;

                    ngToast.create({
                        className: notifications[i].data.type || 'info',
                        content: notifications[i].data.title
                    })
                }

                if (isFirstRefresh) {
                    console.info("[notifications.init] ", notifications.length, " notifications unread");
                }
            }

            function isLoading() {
                return isBusy;
            }

            function hasUnread() {
                return (notifications && notifications.length > 0);
            }

            function markAsRead(notification) {
                if (!notification) return false;
                UserNotifications.markAsRead({ id: notification.id }, function() {
                    refresh();
                });
            }

            function open(notification) {
                if (!notification) return false;
                if (!notification.open_url) return false;

                $location.url(notification.open_url);

                return false;
            }

            function getNotifications() {
                return notifications;
            }

            return {
                getUnread: getNotifications,
                markAsRead: markAsRead,
                open: open,
                refresh: refresh,
                isBusy: isLoading,
                hasUnread: hasUnread,
                setup: setup,
            }

        })
        .run(function(Notifications) {
            Notifications.setup();
        })

})();