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

StackApp.factory('QuestionEval', function($resource) {
    return $resource('http://stackapi.benhamner.com/api/eval/questions');
});

http://stackapi.benhamner.com/api/eval/questions?q={%22functions%22:[{%22name%22:%22count%22,%22field%22:%22id%22}]}

var QuestionCtrl = function($scope, $location, Question, QuestionEval) {
    $scope.get_num_questions = function() {
        var query = angular.toJson({functions:[{name: "count",
                                                field: "id"}]});
        QuestionEval.get({q: query}, 
                         function(res) {
                             $scope.num_questions = res.count__id;
                         });
    }

    $scope.update = function() {
        var query = angular.toJson({order_by:[{field:"close_likelihood", direction:"desc"}],
                                    filters:[{name:"close_likelihood", op:"is_not_null"}],
                                    limit:10});
        Question.get({q: query},
                     function(questions) { 
                         $scope.questions = questions.objects; 
                     });
        $scope.get_num_questions();
    }

    $scope.update();
};
