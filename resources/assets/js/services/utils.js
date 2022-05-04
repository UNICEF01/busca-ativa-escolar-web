(function() {

    identify("core", "utils.js");

    var app = angular.module('BuscaAtivaEscolar');

    app
        .run(function() {
            Array.prototype.shuffle = function() {
                var i = this.length,
                    j, temp;
                if (i == 0) return this;
                while (--i) {
                    j = Math.floor(Math.random() * (i + 1));
                    temp = this[i];
                    this[i] = this[j];
                    this[j] = temp;
                }
                return this;
            };

            Array.prototype.clone = function() {
                return this.slice(0);
            };

        })
        .filter('orderObjectBy', function() {
            return function(items, field, reverse) {
                var filtered = [];

                angular.forEach(items, function(item) {
                    filtered.push(item);
                });

                filtered.sort(function(a, b) {
                    return (a[field] > b[field] ? 1 : -1);
                });

                if (reverse) filtered.reverse();

                return filtered;
            };
        })

    .factory('Utils', function(ngToast) {

            function generateRandomID() {
                return 'rand-' + (new Date()).getTime() + '-' + Math.round(Math.random() * 10000);
            }

            function convertISOtoBRDate(iso_date) {
                if (!iso_date) return '';
                return iso_date.split('-').reverse().join('/');
            }

            function convertBRtoISODate(br_date) {
                if (!br_date) return '';
                return br_date.split('/').reverse().join('-');
            }

            function prepareDateFields(data, dateOnlyFields) {
                for (var i in data) {
                    if (!data.hasOwnProperty(i)) continue;
                    if (dateOnlyFields.indexOf(i) === -1) continue;

                    if (!data[i]) continue;
                    if (("" + data[i]).length <= 0) continue;

                    data[i] = stripTimeFromTimestamp(data[i]);

                    if (("" + data[i]).toLowerCase() === "invalid date") {
                        data[i] = null;
                    }
                }

                return data;
            }

            function prepareCityFields(data, cityFields) {
                for (var i in data) {
                    if (!data.hasOwnProperty(i)) continue;
                    if (cityFields.indexOf(i) === -1) continue;

                    data[i + '_id'] = data[i] ? data[i].id : null;
                    data[i + '_name'] = data[i] ? data[i].name : null;
                }

                return data;
            }

            function unpackDateFields(data, dateOnlyFields) {

                for (var i in data) {
                    if (!data.hasOwnProperty(i)) continue;
                    if (dateOnlyFields.indexOf(i) === -1) continue;
                    data[i] = new Date(data[i] + " 00:00:00");
                }
                return data;
            }

            function stripTimeFromTimestamp(timestamp) {
                return moment(timestamp).format('YYYY-MM-DD');
            }

            function displayValidationErrors(response) {
                if (!response || !response.messages) return false;

                for (var i in response.messages) {
                    if (!response.messages.hasOwnProperty(i)) continue;
                    ngToast.danger(response.messages[i])
                }

                return true;
            }

            function filter(obj, predicate) {
                if (obj.constructor === Array) return obj.filter(predicate);

                var result = {},
                    key;

                for (key in obj) {
                    if (obj.hasOwnProperty(key) && !!predicate(obj[key])) {
                        result[key] = obj[key];
                    }
                }

                return result;
            }

            function extract(field, obj, predicate) {
                var filtered = filter(obj, predicate);
                var result = [];

                for (var i in filtered) {
                    if (!filtered.hasOwnProperty(i)) continue;
                    result.push(filtered[i][field]);
                }

                return result;
            }

            function pluck(collection, value_column, key_column) {
                var hasKeyColumn = !!key_column;
                var plucked = (hasKeyColumn) ? {} : [];

                for (var i in collection) {
                    if (!collection.hasOwnProperty(i)) continue;

                    var value = collection[i][value_column] ? collection[i][value_column] : null;

                    if (!hasKeyColumn) {
                        plucked.push(value);
                        continue;
                    }

                    var key = collection[i][key_column] ? collection[i][key_column] : i;
                    plucked[key] = value;

                }

                return plucked;
            }

            function search(object, callback) {
                for (var i in object) {
                    if (!object.hasOwnProperty(i)) continue;
                    if (callback(object[i])) return object[i];
                }

                return false;
            }

            function validateFields(data, requiredFields) {
                var invalid = [];

                for (var i in requiredFields) {
                    if (!requiredFields.hasOwnProperty(i)) continue;
                    if (data[requiredFields[i]]) continue;

                    invalid.push(requiredFields[i]);
                }

                return invalid;
            }

            function isValid(data, requiredFields, fieldNames, message) {
                var invalidFields = validateFields(data, requiredFields);

                if (invalidFields.length <= 0) return true;

                message += invalidFields
                    .map(function(field) {
                        return fieldNames[field] || field;
                    })
                    .join(", ");

                ngToast.danger(message);

                return false;
            }

            function haveEqualsValue(name, values) {
                var value = _.uniq(values)
                if (value.length === 1) {
                    ngToast.danger(name + ' não podem ser iguais');
                    return false;
                } else {
                    return true;
                }
            }


            function isValidBirthDay(user) {

                const data = new Date(user.dob);

                const currentdate = new Date();

                const maxDate = new Date(currentdate.setDate(currentdate.getDate() + 1));

                const mindate = new Date(currentdate.setFullYear(currentdate.getFullYear() - 100));

                if (data < maxDate && data > mindate) {
                    return true;
                } else {
                    alert('Informe uma data válida!')
                }
            }


            function isvalidTerm(value) {
                if (value)
                    return true;
                ngToast.danger("Os TERMOS DE USO E POLÍTICA DE PRIVACIDADE precisam ser lidos e aceitos");
                return false;
            }

            function basename(str) {
                var base = ("" + str).substring(str.lastIndexOf('/') + 1);

                if (base.lastIndexOf(".") !== -1) {
                    base = base.substring(0, base.lastIndexOf("."));
                }

                return base;
            }

            function renderCallStack(stack) {
                if (!stack) return ['[ empty stack! ]'];

                var messages = [];
                var maxCalls = 12;
                var numCalls = 0;

                for (var callNum in stack) {

                    if (numCalls++ > maxCalls) {
                        messages.push("[ snip ... other " + (stack.length - numCalls) + " calls in stack ]");
                        return messages;
                    }

                    if (!stack.hasOwnProperty(callNum)) continue;
                    var c = stack[callNum];

                    messages.push(
                        'at ' +
                        (c.class ? c.class : '[root]') +
                        (c.type ? c.type : '@') +
                        (c.function ? c.function : '[anonymous function]') +
                        '()' +
                        ((c.file) ? (" @ " + basename(c.file) + ':' + (c.line ? c.line : '[NL]')) : ' [no file]')
                    );
                }

                return messages;

            }

            return {
                stripTimeFromTimestamp: stripTimeFromTimestamp,
                prepareDateFields: prepareDateFields,
                prepareCityFields: prepareCityFields,
                unpackDateFields: unpackDateFields,
                convertISOtoBRDate: convertISOtoBRDate,
                displayValidationErrors: displayValidationErrors,
                convertBRtoISODate: convertBRtoISODate,
                generateRandomID: generateRandomID,
                validateFields: validateFields,
                renderCallStack: renderCallStack,
                isValid: isValid,
                basename: basename,
                filter: filter,
                extract: extract,
                pluck: pluck,
                search: search,
                haveEqualsValue: haveEqualsValue,
                isvalidTerm: isvalidTerm,
                isValidBirthDay: isValidBirthDay
            };
        })
        .directive('stringToNumber', function() {
            return {
                require: 'ngModel',
                link: function(ngModel) {
                    ngModel.$parsers.push(function(value) {
                        return '' + value;
                    });
                    ngModel.$formatters.push(function(value) {
                        return parseFloat(value);
                    });
                }
            };
        })

    .filter('parseDate', function() {
        return function(input) {
            return new Date(input);
        };
    });

})();

function identify(namespace, file) {

}