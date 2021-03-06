angular.module('todoController', [])

// inject the Todo service factory into our controller
.controller('mainController', ['$scope', '$http', 'Todos', 'MetaList', function($scope, $http, Todos, MetaList) {
    $scope.formData = {};
    $scope.loading = true;
    $scope.metalist = {};
    $scope.metalist.total = '0.99';

    // GET =====================================================================
    // when landing on the page, get all todos and show them
    // use the service to get all the todos
    Todos.get()
        .success(function(data) {
            $scope.todos = data;
            $scope.loading = false;
        });
    MetaList.get()
        .success(function(data) {
            console.log("metalist get:" + data);
            $scope.metalist = data;
            $scope.loading = false;
        });

    // CREATE ==================================================================
    // when submitting the add form, send the text to the node API
    $scope.createTodo = function() {

        // validate the formData to make sure that something is there
        // if form is empty, nothing will happen
        if ($scope.formData.text != undefined) {
            $scope.loading = true;

            // call the create function from our service (returns a promise object)
            console.log("creating list item:" + JSON.stringify($scope.formData));
            Todos.create($scope.formData)

            // if successful creation, call our get function to get all the new todos
            .success(function(data) {
                $scope.loading = false;
                // $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.todos = data; // assign our new list of todos
                console.log("updating metalist data:" + JSON.stringify($scope.formData));

            });

        }
    };

    $scope.updateMetalist = function(){
    	                MetaList.add($scope.formData).success(function(data) {
                    $scope.metalist = data;
                });
    }

    // DELETE ==================================================================
    // delete a todo after checking it
    $scope.deleteTodo = function(id) {
        console.log("deleting id:" + id);
        $scope.loading = true;
        MetaList.subtract(id).success(function(data) {
            $scope.metalist = data;
        });
        Todos.delete(id)
            // if successful creation, call our get function to get all the new todos
            .success(function(data) {
                $scope.loading = false;
                $scope.todos = data; // assign our new list of todos
            });

    };
}]);
