Module to collect AngularJS performance metrics
===============================================

```javascript
angular.module('app', ['ng-metrics'])
       .config(['ngMetrics', function(ngMetrics) {
         ngMetrics.enable();
       });
```
