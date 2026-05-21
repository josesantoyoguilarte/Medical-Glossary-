/**
 * Created by Del on 22/12/15.
 */
angular.module('CreeMedicalGlossaryApp.filters',['ngSanitize'])
   
    .filter('html',['$sce',function($sce){
		return function(val){
			return val==null?'':$sce.trustAsHtml(val.replace(/\\u003C\/b\\u003E/g,"<strong>").replace(/\\u003C\/b\\u003E/g,"</strong>"));
		}
	}])
	.filter('getUUID',function(){
		return function(val){
			return val.replace(/_/g,"");
		}
	})
	.filter('trustedURL',['$sce',function($sce){
		return function(val){
			return val==null?'':$sce.trustAsResourceUrl(val);
		}
	}])

	/*
	*Created by Jose march 2nd
	*/
	.filter('clean',function(){
		return function(val){
			return val;//replace(/_03C/g,"");
		}
	})
;