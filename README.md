Module to collect AngularJS performance metrics
===============================================

```javascript
angular.module('app', ['ng-metrics'])
       .run(['ngMetrics', function(ngMetrics) {
         ngMetrics.enable();
       });
```
