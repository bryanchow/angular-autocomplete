angular-autocomplete
====================

angular-autocomplete is a minimalist Angular.js directive for adding
auto-complete dropdowns to text inputs.


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
