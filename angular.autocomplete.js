/*jslint browser:true */
/*global angular */

/*
 * angular-autocomplete
 * https://github.com/bryanchow/angular-autocomplete
 */

(function(angular) {

    var module = angular.module('ff.autocomplete', []);

    var namespace = 'autocomplete';

    var SCOPE = {
        sourceFn: '=' + namespace + 'Fn',
        callback: '=' + namespace + 'Callback',
        minQueryLen: '=?' + namespace + 'MinQueryLen',
        maxQueryLen: '=?' + namespace + 'MaxQueryLen',
        maxItems: '=?' + namespace + 'MaxItems',
        resultsId: '@' + namespace + 'ResultsId',
        itemTemplate: '=?' + namespace + 'ItemTemplate',
        selectField: '@' + namespace + 'SelectField',
        delay: '=?' + namespace + 'Delay'
    };

    var DEFAULTS = {
        minQueryLen: 1,
        maxQueryLen: 20,
        maxItems: 20,
        resultsId: "",
        itemTemplate: "{{ item }}",
        delay: 200
    };

    var KEYS = {
        TAB: 9,
        ENTER: 13,
        END: 35,
        PAGE_UP: 33,
        PAGE_DOWN: 34,
        HOME: 36,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40
    };

    function link(scope, el, $compile, $timeout) {

        angular.extend(scope, {
            results: [],
            selectedIndex: -1,
            isVisible: false
        });

        scope.callback = scope.callback || function() {};

        var searchTimeout;

        var resultsTemplate = (
            '<ul id="' + (scope.resultsId || DEFAULTS.resultsId) + '" ' +
            'class="autocomplete-results" ng-show="isVisible" ' +
            'ng-style="resultsStyle" class="autocomplete-results">' +
            '<li ng-class="{selected: isSelected($index)}" ' +
            'ng-mousedown="selectItem($index)" ng-repeat="item in results">' +
            (scope.itemTemplate || DEFAULTS.itemTemplate) + '</li></ul>'
        );
        document.body.appendChild($compile(resultsTemplate)(scope)[0]);

        scope.isSelected = function(index) {
            return (scope.selectedIndex === index);
        };

        scope.selectItem = function(index) {
            if (parseInt(index, 10) >= 0) {
                scope.selectedIndex = index;
            }
            didSelectItem();
        };

        function showResults() {
            if (el[0] == document.activeElement) {
                scope.isVisible = true;
            }
        }

        function hideResults() {
            scope.isVisible = false;
        }

        function didSelectItem() {
            hideResults();
            scope.callback(scope.results[scope.selectedIndex]);
        }

        function getItemVal(item) {
            return scope.selectField ? item[scope.selectField] : item;
        }

        scope.$watch('selectedIndex', function(index) {
            var item = scope.results[index];
            if (item) {
                el.val(getItemVal(item));
            }
        });

        scope.$watch('results', function(results) {
            if (results.length > 0) {
                showResults();
            } else {
                hideResults();
            }
        }, true);

        scope.$watch('isVisible', function(isVisible) {
            if (isVisible) {
                var domEl = el[0];
                var bounds = domEl.getBoundingClientRect();
                var style = domEl.style;
                var width = (
                    domEl.clientWidth - style.borderLeftWidth -
                    style.borderRightWidth
                );
                var units = "px";
                scope.resultsStyle = {
                    position: "fixed",
                    top: bounds.top + bounds.height + units,
                    left: bounds.left + units,
                    width: width + units,
                    'min-width': width + units
                };
            }
        });

        // Handle cursor movement keys before keyup fired
        el.bind('keydown', function(e) {
            var max = scope.results.length - 1;
            if (e.keyCode == KEYS.UP) {
                if (scope.results) {
                    showResults();
                }
                scope.selectedIndex = (
                    scope.selectedIndex > 0 ?
                    scope.selectedIndex - 1 : max
                );
            } else if (e.keyCode == KEYS.DOWN) {
                if (scope.results.length) {
                    showResults();
                }
                scope.selectedIndex = (
                    scope.selectedIndex < max ?
                    scope.selectedIndex + 1 : 0
                );
            } if (e.keyCode == KEYS.ENTER || e.keyCode == KEYS.TAB) {
                if (
                    scope.selectedIndex >= 0 &&
                    el.val() === getItemVal(scope.results[scope.selectedIndex])
                ) {
                    didSelectItem();
                } else {
                    hideResults();
                }
            }
            scope.$apply();
        });

        el.bind('keyup', function(e) {
            // Ignore cursor movement keys
            for (var key in KEYS) {
                if (e.keyCode == KEYS[key]) {
                    return false;
                }
            }
            $timeout.cancel(searchTimeout);
            var query = el.val().trim();
            // Enforce min/max query length
            if (
                query.length < (scope.minQueryLen || DEFAULTS.minQueryLen) ||
                query.length > (scope.maxQueryLen || DEFAULTS.maxQueryLen)
            ) {
                scope.$apply(function() {
                    hideResults();
                });
                return;
            }
            searchTimeout = $timeout(function() {
                var maxItems = scope.maxItems || DEFAULTS.maxItems;
                var returned = scope.sourceFn(query);
                if (returned) {
                    // Source returned a promise
                    if (returned.then) {
                        returned.then(function(data) {
                            scope.selectedIndex = -1;
                            if (data && data.length) {
                                scope.results = data.slice(0, maxItems);
                                showResults();
                            } else {
                                hideResults();
                            }
                        });
                    // Source returned a list
                    } else if (returned.length) {
                        showResults();
                        scope.results = returned.slice(0, maxItems);
                    } else {
                        hideResults();
                    }
                } else {
                    hideResults();
                }
            }, scope.delay || DEFAULTS.delay);
        });

        el.bind('blur', function() {
            scope.$apply(function() {
                hideResults();
            });
        });

    }

    module.directive('autocomplete', [
        '$compile', '$timeout',
        function($compile, $timeout) {
            return {
                restrict: 'AE',
                scope: SCOPE,
                template: '<input type="text" />',
                link: function(scope, el) {
                    return link(scope, el, $compile, $timeout);
                }
            };
        }
    ]);

}(angular));
