import angular from 'angular';
import _ from 'lodash';
import ngRoute from 'angular-route';

angular.module('fswd.todo', ['ngRoute'])
  .service('TodoListService', function($http) {
    var todoList = ['Groceries', 'Dinner', 'Breakfast'];

    this.retrieveTodoList = function() {
      return $http.get('/tasks')
        .then(function(response) {
          todoList = response.data;
        });
    };

    this.getTodoList = function() {
      return todoList;
    };

    this.removeTodo = function(item) {
      todoList = _.without(todoList, item);
    };

    this.addTodo = function(toAdd) {
      $http.post('/tasks', { todo: toAdd })
        .then(function(response) {
          todoList = response.data;
        });
    };

  })
  .controller('TodoListController', function(TodoListService, $scope) {
    var vm = this;
    TodoListService.retrieveTodoList();

    vm.removeTodo = function(item) {
      TodoListService.removeTodo(item);
    };

    vm.addTodo = function(toAdd) {
      TodoListService.addTodo(toAdd);
    };

    vm.clickedInDirective = function(stuff) {
      console.log(stuff);
    };

    $scope.$watch(function() {
      return TodoListService.getTodoList();
    }, function(newVal, oldVal) {
      vm.todoList = newVal;
    });

  })
  .directive('fswdTask', function() {
    return {
      restrict: 'E',
      scope: {
        todo: '=task'
      },
      template: "{{ todo.name }} ({{ todo.createdAt | date:'shortDate'}})"
    }
  })
  .directive('fswdTaskList', function() {
    return {
      restrict: 'E',
      scope: {
        taskList: '=',
        onClick: '&',
        toFilter: '<'
      },
      bindToController: true,
      controllerAs: 'vm',
      controller: function($scope) {
        var self = this;

        $scope.$watch(
          function() { return self.toFilter; },
          function(newVal, oldVal) {
            if (newVal !== oldVal) {
              if (_.isString(newVal)) {
                self.taskFilter = self.toFilter = { createdAt: newVal };
              } else {
                self.taskFilter = newVal;
              }
            }
          }
        );
      },
      templateUrl: '/partials/taskList'
    }
  })
  .component('fswdTaskListComponent', {
      bindings: {
        taskList: '=',
        onClick: '&',
        toFilter: '<'
      },
      controller: function($scope) {
        var self = this;

        $scope.$watch(
          function() { return self.toFilter; },
          function(newVal, oldVal) {
            if (newVal !== oldVal) {
              if (_.isString(newVal)) {
                self.taskFilter = { createdAt: newVal };
              } else {
                self.taskFilter = newVal;
              }
            }
          }
        );
      },
      templateUrl: '/partials/taskListComponent'
    }
  });
