var StackApp = angular.module("StackApp", ["ngResource"])
    .config(function($routeProvider) {
        $routeProvider.
            when('/', { controller: QuestionCtrl, templateUrl: 'question.html' }).
            otherwise({ redirectTo: '/' });
    })
    .config(['$httpProvider', function($httpProvider) {
        delete $httpProvider.defaults.headers.common["X-Requested-With"]
    }]);

StackApp.factory('Question', function($resource) {
    return $resource('http://stackapi.benhamner.com/api/questions');
});

var QuestionCtrl = function($scope, $location, Question) {
    var res = Question.get( { q:angular.toJson({order_by:[{field:"close_likelihood", direction:"desc"}],
                                               filters:[{name:"close_likelihood", op:"is_not_null"}],
                                               limit:10}) },
                            function() { $scope.questions = res.objects; });
    window.question = res;
};