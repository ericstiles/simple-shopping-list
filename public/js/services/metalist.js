angular.module('metalistService', [])

	// super simple service
	// each function returns a promise object 
	.factory('MetaList', ['$http',function($http) {
		return {
			get : function() {
				return $http.get('/api/metalist');
			},
			add : function(todoData) {
				return $http.post('/api/metalist/add', todoData);
			},
			subtract : function(id) {
				console.log("in service deleting id: " + id)
				return $http.post('/api/metalist/subtract', {id: id});
			}
		}
	}]);