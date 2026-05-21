/**
 * Created by Del on 22/12/15.
 */
angular.module('CreeMedicalGlossaryApp.directives',[])
   
    .directive('detailView',['$rootScope',
        function(rootScope){


            return{
                transclude: true,
                scope:{
                    uuid:'=',
                    term:'=',
					locales:'='
					
					

                },
                controller:['$scope','$http', function($scope,$http,$location){
                    
                    
                }],
                templateUrl:"templates/entry.html"
            }
        }
    ])
	
	/* .directive('detailCategory',['$rootScope',
        function(rootScope){


            return{
                transclude: true,
                scope:{
                    uuid:'=',
                    term:'=',
					locales:'='
				
					
					
					

                },
                controller:['$scope','$http', function($scope,$http,$location){
                    
                    
                }],
                templateUrl:"templates/categoryTerms.html"
            }
        }
    ]) */
;

