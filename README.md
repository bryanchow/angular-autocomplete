angular-autocomplete
====================

angular-autocomplete is a minimalist Angular.js directive for adding
auto-complete dropdowns to text inputs.

* Does not require jQuery or any other external libraries
* Up and down arrow key handling
* Item selection on tab and enter
* Item selection on mouse click
* Close dropdown on blur

Minimal CSS styles are set by the directive to make the dropdown easy to
customize.


Usage
-----

Markup:

    <div ng-controller="MyController">
        <input autocomplete autocomplete-fn="getSuggestions" />
    </div>


JS:

    var module = angular.module('myApp', ['ff.autocomplete']);

    module.controller('MyController', [
        '$scope', function($scope) {

            $scope.getSuggestions = function(query) {
                return [
                    "Los Angeles, CA",
                    "New York, NY",
                    "Vancouver, BC"
                ]
            };

        }
    ]);
