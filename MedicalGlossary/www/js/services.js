angular.module('CreeMedicalGlossaryApp.services', ['ngResource'])

.factory('Category', ['$resource','$rootScope',function($resource,$rootScope) {
  
    return $resource('data/:folder/:name.json', {}, {
      query: {method:'GET', params:{'name':'categories','folder':'eng'}, isArray:false},
	  
    });
}])

.factory('Conversation', ['$resource','$rootScope',function($resource,$rootScope) {
  
    return $resource('data/:folder/:language/:name.json', {}, {
      query: {method:'GET', params:{'folder':'conversation','language':$rootScope.locale,'name':'McGill_Pain_Questionnaire'}, isArray:false},
	  
    });
}])

.factory('CategoryTree', ['$resource',function($resource) {
     console.log("loading");
    return $resource('data/:folder/:name.json', {}, {
      query: {method:'GET', params:{'name':'tree-map','folder':'eng'}, isArray:false},
	  
    });
}])


/* 
.factory('CategoryTerm', ['$resource','$rootScope',function($resource,$rootScope) {
  console.log("Term",$rootScope.locale);
    return $resource('data/:folder/:termUUID.json', {}, {
      query: {method:'GET', params:{'termUUID':$rootScope.uuid,'folder':$rootScope.locale}, isArray:false, cache:false},
	  
	  
    }) */

.factory('Term', ['$resource','$rootScope',function($resource,$rootScope) {
  console.log("Term",$rootScope.locale);
    return $resource('data/:folder/:termUUID.json', {}, {
      query: {method:'GET', params:{'termUUID':'terms','folder':$rootScope.locale}, isArray:true},
	  get: {method:'GET', params:{'folder':'entries'}, isArray:false}
	  
    });
}]);

