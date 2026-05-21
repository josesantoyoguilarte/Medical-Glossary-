angular.module('CreeMedicalGlossaryApp.controllers', [])

.controller('GlossaryCtrl', function($rootScope,$scope, Category, Term, CategoryTree) {
	$rootScope.locales ={
		eng: 'EN',
		fra: 'FR',
		crj: 'S',
		crl: 'N'
	};
  $rootScope.$watch('locale',function(newVal,oldVal){
	  console.log("changed locale from "+oldVal+" to "+newVal);
	  
	  $scope.terms = Term.query();
	  $rootScope.$apply();
  });
 
  
  $scope.ids = CategoryTree.query();
  
  $scope.categories = Category.query();
  
  $scope.terms = Term.query();
  
  /* $scope.categoryTerm = CategoryTerm.query(); */
/*   
  $scope.inSearch = function (uuid){
	  
	  if($scope.terms.visible==undefined){
		  console.log(index);
		  $scope.terms.visible=false;
		  $scope.terms.details = Term.get({termUUID:$scope="uuid"});
		  
		  
	  }
	  $scope.terms.Term.uuid.visible=!$scope.terms.Term.uuid.visible;
  }; */
  
   
  
  $scope.toggleVisibility = function (index){
	  
	  if($scope.terms[index].visible==undefined){
		  console.log(index);
		  $scope.terms[index].visible=false;
		  $scope.terms[index].details = Term.get({termUUID:$scope.terms[index].Term.uuid});
		  
		  
	  }
	  $scope.terms[index].visible=!$scope.terms[index].visible;
  };
  
  $scope.showCategory = function (uuid){
	  $scope.category = Category.get({folder:'eng', name:uuid},function(data){
		  //console.log(data);
		  $scope.terms = data.Terms;
	  });
	  $scope.terms = $scope.categories[index].terms;
  };


})

.controller('MoreCtrl',['$scope','$rootScope',function($scope,$rootScope) {
	
		
	/* $scope.toggleLocale=function(){
		console.log($scope.locale,$rootScope.locale);
		$rootScope.locale=$rootScope.locale.match('eng')!=null?'fra':'eng';
	}; */
	
	$scope.setLocale=function(locale){
		/* console.log($scope.locale,$rootScope.locale); */
		$rootScope.locale=locale;
		$scope.locale=locale;
		console.log($scope.locale,$rootScope.locale);
	};
	
}])



.controller('DiagramsCtrl', function($scope) {})

.controller('ConversationCtrl', function($scope,Conversation) {
	$scope.conversations = Conversation.query();
	$scope.playAudio = function(id){
		var audio =angular.element(document).find("audio");
		for(var a in audio){
			
			try{
				//console.log(audio[a].id);
			if(audio[a].id==id){

				audio[a].play();
				break;
			}}catch(err){}
		}
		//console.log("play ",id, angular.element(document).find("audio"));
		//angular.element(btn).parent().find("audio")[0].play();
	};
})

