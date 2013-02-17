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
        $scope.is_loading = true;
        $scope.questions = [];
        var query = angular.toJson({order_by:[{field:"close_likelihood", direction:$scope.direction}],
                                    filters:[{name:"close_likelihood", op:"is_not_null"}],
                                    limit:$scope.limit});
        Question.get({q: query},
                     function(questions) { 
                         $scope.questions = questions.objects;
                         $scope.is_loading = false; 
                     });
        $scope.get_num_questions();
    }

    $scope.reverse = function() {
        if ($scope.direction=="desc") {
            $scope.direction = "asc";
        } else {
            $scope.direction = "desc";
        }
        $scope.update();
    }

    $scope.direction = "desc";

    $scope.limit = 10;
    $scope.update();
};
