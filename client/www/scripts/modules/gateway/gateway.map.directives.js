/*
 *
 *
 *   GATEWAY MAP DIRECTIVES
 *
 * */
Gateway.directive('slGatewayMapForm', [
  'GatewayServices',
  '$log',
  'growl',
  '$modal',
  function(GatewayServices,$log,growl,$modal) {
    return {
      restrict: 'E',
      scope: {
        map: '=',
        context: '=',
        hidebuttons: '='
      },
      templateUrl: './scripts/modules/gateway/templates/gateway.map.form.html',
      controller: ['$scope',
        function($scope) {

          $scope.isMappingDirty = false;
          $scope.isMappingNameDirty = false;
          $scope.originalMap = {};

          $scope.setMapPipelineId = function(map, pipeId) {
            if (map && pipeId) {
              map.pipelineId = pipeId;
            }
          };

          $scope.changeMapVerb = function(map, verb) {
            map.verb = verb;
          };

          function refreshMaps() {
            $scope.context.gatewayMaps = GatewayServices.getGatewayMaps()
              .then(function(maps) {

                $scope.context.gatewayMaps = maps;

              });
          }

          $scope.confirmSaveCurrentMapping = function(map){
            var x = map;
            var modalDlg = $modal.open({
              templateUrl: './scripts/modules/gateway/templates/confirm.mapping.save.html',
              size: 'md',
              scope: $scope,
              controller: function($scope, $modalInstance, title) {
                $scope.isModal = true;
                $scope.title = title;
                $scope.close = function() {
                  $modalInstance.dismiss();
                };

                $scope._saveMapping = function(xxx){
                  $scope.saveCurrentMapping(map);
                  $scope.close();
                }
              },
              resolve: {
                title: function() {
                  return 'Confirm Mapping Edit';
                }
              }
            });

          };

          $scope.saveCurrentMapping = function(map) {
            if (map.name && map.endpoint) {
              if (map.pipelineId && map.pipelineId.id) {
                map.pipelineId = map.pipelineId.id;
              }
              // check if name has changed
              /*
              *
              *

               *
              * */
              //if ($scope.context.originalInstance.name && ($scope.context.originalInstance.name !== map.name)) {
              //  // rename in effect
              //  GatewayServices.renameMapping(map, map.name, $scope.context.originalInstance.name)
              //    .$promise
              //    .then(function(map) {
              //      GatewayServices.saveGatewayMap(map)
              //        .$promise
              //        .then(function(map) {
              //          growl.addSuccessMessage('Mapping Saved');
              //          $scope.$parent.refreshMappings();
              //        });
              //    });
              //}
              //else {
                GatewayServices.saveGatewayMap(map)
                  .$promise
                  .then(function(map) {
                    growl.addSuccessMessage('Gateway Map Saved');
                    $scope.$parent.refreshMappings();

                  });
            //  }



            }
          };
        }
      ],
      link: function(scope, el, attrs) {
        scope.$watch('map.pipelineId', function(newVal, oldVal) {
          if (newVal) {
            $log.debug('the pipeline id has changed');
            scope.map.pipeline = GatewayServices.getPipelineDetail(newVal)
            .then(function(pipe) {
                scope.map.pipeline = pipe;
              });

          }

        }, true);
        /*
         *
         * Dirty check
         *
         * */
        scope.$watch('map', function(newVal, oldVal) {
          scope.isMappingDirty = false;
          scope.isRename = false;
          if (newVal && (newVal.id && oldVal.id)) {

            if (newVal !== oldVal) {
              if (newVal.pipeline.isActive) {
                scope.context.originalInstance.pipeline.isActive = true;
              }
              if (!angular.equals(scope.context.originalInstance, newVal)) {
                scope.isMappingDirty = true;

              }
              else {
                $log.debug('|||||   IIm freeeasdf');
              }
            }
            if (newVal.name !== scope.context.originalInstance.name) {
              newVal.oldName = scope.context.originalInstance.name;
              scope.isMappingNameDirty = true;
            }
          }

        }, true);
      }
    }
  }
]);
Gateway.directive('slGatewayMapListScopeDisplay', [
  function() {
    return {
      restrict: 'E',
      scope: {
        scopes: '='
      },
      templateUrl: './scripts/modules/gateway/templates/gateway.map.list.scopes.html',
      controller: [
        '$scope',
        'GatewayServices',
        function($scope, GatewayServices) {



        }
      ]
    }
  }
]);
Gateway.directive('slGatewayMapList', [
  function() {
    return {
      restrict: 'E',
      templateUrl: './scripts/modules/gateway/templates/gateway.map.list.html',
      controller: [
        '$scope',
        'GatewayServices',
        function($scope, GatewayServices) {



        }
      ]
    }
  }
]);
Gateway.directive('slGatewayMapMainView', [
  '$log',
  function($log) {
    return {
      restrict: 'E',
      templateUrl: './scripts/modules/gateway/templates/gateway.map.main.html',
      link: function(scope, el, attrs) {
        scope.$watch('gatewayCtx.currentInstanceId', function(newVal, oldVal) {
          if (scope.gatewayCtx.currentView === GATEWAY_CONST.MAPPING_TYPE) {
            if (newVal !== oldVal) {
              scope.setMainNav(GATEWAY_CONST.MAPPING_TYPE, newVal);
            }
          }
        });
      }
    }
  }
]);
