(function() {

    angular.module('BuscaAtivaEscolar')
        .run(function(Platform) {
            Platform.setup();
        })
        .service('Platform', function Platform($rootScope) {

            var servicesRequired = [
                'StaticData',
                'Language',
                'Identity'
            ];

            var servicesReady = [];
            var allReady = false;

            var flags = {};

            var whenReadyCallbacks = [];

            function setup() {



                for (var i in servicesRequired) {
                    if (!servicesRequired.hasOwnProperty(i)) continue;


                    $rootScope.$on(servicesRequired[i] + '.ready', function(event) {
                        onServiceReady(event.name.split('.').shift());
                    })
                }

                $rootScope.$on('$stateChangeStart', clearRegisteredCallbacks);
                $rootScope.$on('$stateChangeSuccess', checkIfAllServicesReady);
                $rootScope.$on('Platform.ready', fireRegisteredCallbacks);
            }

            function setFlag(flag, value) {

                flags[flag] = value;
            }

            function getFlag(flag) {
                return flags[flag];
            }

            function onServiceReady(service) {

                if (servicesReady.indexOf(service) === -1) {
                    servicesReady.push(service);
                }

                checkIfAllServicesReady();
            }

            function clearRegisteredCallbacks() {

                whenReadyCallbacks = [];
            }

            function checkIfAllServicesReady() {
                if (servicesReady.length < servicesRequired.length) return;
                allReady = true;



                $rootScope.$broadcast('Platform.ready');
            }

            function fireRegisteredCallbacks() {

                for (var i in whenReadyCallbacks) {
                    if (!whenReadyCallbacks.hasOwnProperty(i)) continue;
                    whenReadyCallbacks[i]();
                }
            }

            function isReady() {
                return allReady;
            }

            function whenReady(callback) {
                if (isReady()) return callback(); // Callback being registered post-ready, so we can already ping it

                whenReadyCallbacks.push(callback);
            }

            return {
                setup: setup,
                isReady: isReady,
                whenReady: whenReady,
                setFlag: setFlag,
                getFlag: getFlag,
            }

        });

})();