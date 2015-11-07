Module to collect AngularJS performance metrics
===============================================

```javascript
angular.module('app', ['ng-metrics'])
       .run(['ngMetrics', function(ngMetrics) {
         ngMetrics.metricsServer = 'localhost:1337'; // Optional, if using your own backend-implementation
         ngMetrics.appId = 'Eysmm2wR'; // App ID
         ngMetrics.enable();
       });
```
