// Ionic CreeMedicalGlossaryApp App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'CreeMedicalGlossaryApp' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'CreeMedicalGlossaryApp.services' is found in services.js
// 'CreeMedicalGlossaryApp.controllers' is found in controllers.js
angular.module('CreeMedicalGlossaryApp', ['ionic', 'CreeMedicalGlossaryApp.controllers', 'CreeMedicalGlossaryApp.services','CreeMedicalGlossaryApp.directives','CreeMedicalGlossaryApp.filters'])//,'jett.ionic.filter.bar'

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  
  .state('tab.glossary', {
    url: '/glossary',
    views: {
      'tab-glossary': {
        templateUrl: 'templates/tab-glossary.html',
        controller: 'GlossaryCtrl'
      }
    }
  })
  
  .state('tab.diagrams', {
    url: '/diagrams',
    views: {
      'tab-diagrams': {
        templateUrl: 'templates/tab-diagrams.html',
        controller: 'DiagramsCtrl'
      }
    }
  })
  
  .state('tab.more', {
    url: '/more',
    views: {
      'tab-more': {
        templateUrl: 'templates/tab-more.html',
        controller: 'MoreCtrl'
      }
    }
  })
  
  .state('tab.preference', {
    url: '/more/preference',
    views: {
      'tab-more': {
        templateUrl: 'templates/tab-more-preference.html',
        controller: 'MoreCtrl'
      }
    }
  })
  
  .state('tab.diagram-26', {
    url: '/diagram-26',
    views: {
      'tab-diagrams': {
        templateUrl: 'templates/diagram-26.html',
        controller: 'DiagramsCtrl'
      }
    }
  })
  .state('tab.about-credits', {
    url: '/more/about-credits',
    views: {
      'tab-more': {
        templateUrl: 'templates/about-credits.html',
        controller: 'MoreCtrl'
      }
    }
  })
  .state('tab.conversation', {
    url: '/more/conversation',
    views: {
      'tab-more': {
        templateUrl: 'templates/tab-conversation.html',
        controller: 'ConversationCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/glossary');

});
