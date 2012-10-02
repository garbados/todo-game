$(function(){

// Todo Model

// Our basic Todo model has title, order, and done attributes.
  var Todo = Backbone.Model.extend({

// Default attributes for the todo item.
    defaults: function() {
      return {
        title: "empty todo...",
        priority: 5,
        due_date: null,
        done: false
      };
    },

// Ensure that each todo created has title.
    initialize: function() {
      if (!this.get("title")) {
        this.set({"title": this.defaults.title});
      }
    },

// Toggle the done state of this todo item.
    toggle: function() {
      var completed_on = null;
      if (!this.get("done")) {
      	completed_on = new Date();
      }
      this.save({
      	done: !this.get("done"),
      	done_date: completed_on
      });
    },

// Remove this Todo from localStorage and delete its view.
    clear: function() {
      this.destroy();
    }

  });

// Todo Collection

// The collection of todos is backed by localStorage instead of a remote server.
  var TodoList = Backbone.Collection.extend({

// Reference to this collection's model.
    model: Todo,

// Save all of the todo items under the "todos" namespace.
    localStorage: new Store("todos-backbone"),

// Filter down the list of all todo items that are finished.
    done: function() {
      return this.filter(function(todo){ return todo.get('done'); });
    },

// Filter down the list to only todo items that are still not finished.
    remaining: function() {
      return this.without.apply(this, this.done());
    },

// Todos are sorted by the days until their due date, if they have one, or their priority, if they don't.
    comparator: function(todo) {
      var due_date = todo.get('due_date');
      if (due_date) {
      	var now = new Date();
      	return Math.round((due_date - now)/1000/60/60/24);
      } else {
      	return todo.get('priority');
      }
    }

  });

// Create our global collection of Todos.
  var Todos = new TodoList;

// Todo Item View

// The DOM element for a todo item...
  var TodoView = Backbone.View.extend({

// ... is a list tag.
    tagName:  "tr",

// Cache the template function for a single item.
    template: _.template($('#item-template').html()),

// The DOM events specific to an item.
    events: {
      "click .toggle"   : "toggleDone",
      "dblclick .view"  : "edit",
      "click a.destroy" : "clear",
      "keypress .edit"  : "updateOnEnter",
      "blur .edit"      : "close"
    },

// The TodoView listens for changes to its model, re-rendering. Since there's a one-to-one correspondence between a Todo and a TodoView in this app, we set a direct reference on the model for convenience.
    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
    },

// Re-render the titles of the todo item.
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.toggleClass('done', this.model.get('done'));
      this.input = this.$('.edit');
      return this;
    },

// Toggle the "done" state of the model.
    toggleDone: function() {
      this.model.toggle();
    },

// Switch this view into "editing" mode, displaying the input field.
    edit: function() {
      this.$el.addClass("editing");
      this.input.focus();
    },

// Close the "editing" mode, saving changes to the todo.
    close: function() {
      var value = this.input.val();
      if (!value) this.clear();
      this.model.save({title: value});
      this.$el.removeClass("editing");
    },

// If you hit enter, we're through editing the item.
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

// Remove the item, destroy the model.
    clear: function() {
      this.model.clear();
    }

  });

// The Application

// Our overall AppView is the top-level piece of UI.
  var AppView = Backbone.View.extend({

// Instead of generating a new element, bind to the existing skeleton of the App already present in the HTML.
    el: $("#todoapp"),

// Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template($('#stats-template').html()),

// Delegated events for creating new items, and clearing completed ones.
    events: {
      "keypress #new-todo":  "createOnEnter",
      "keypress #todo-priority":  "createOnEnter",
      "keypress #todo-due-date":  "createOnEnter",
      "click #clear-completed": "clearCompleted",
      "click #toggle-all": "toggleAllComplete"
    },

// At initialization we bind to the relevant events on the Todos collection, when items are added or changed. Kick things off by loading any preexisting todos that might be saved in localStorage.
    initialize: function() {

      this.input = this.$("#new-todo");
      this.priority = this.$("#todo-priority");
      this.due_date = this.$("todo-due-date");
      this.allCheckbox = this.$("#toggle-all")[0];

      Todos.bind('add', this.addOne, this);
      Todos.bind('reset', this.addAll, this);
      Todos.bind('all', this.render, this);

      this.footer = this.$('footer');
      this.main = $('#main');

      Todos.fetch();
    },

// Re-rendering the App just means refreshing the statistics -- the rest of the app doesn't change.
    render: function() {
      var done = Todos.done().length;
      var remaining = Todos.remaining().length;

      // if (Todos.length) {
        this.main.show();
        this.footer.show();
        this.footer.html(this.statsTemplate({done: done, remaining: remaining}));
      // } else {
      //   this.main.hide();
      //   this.footer.hide();
      // }

      this.allCheckbox.checked = !remaining;
    },

// Add a single todo item to the list by creating a view for it, and appending its element to the <ul>.
    addOne: function(todo) {
      var view = new TodoView({model: todo});
      var index = Todos.indexOf(todo);
      var selector = this.$("#todo-list tr:eq(" + index.toString() + ")")
      if (selector) {
      	selector.after(view.render().el);
      } else {
      	this.$('#todo-list').append(view.render().el);
      }
    },

// Add all items in the Todos collection at once.
    addAll: function() {
      Todos.each(this.addOne);
    },

// If you hit return in the main input field, create new Todo model, persisting it to localStorage.
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.input.val()) return;

      Todos.create({
      	title: this.input.val(),
      	due_date: this.due_date.val(),
      	priority: this.priority.val()
      });
      this.input.val('');
    },

// Clear all done todo items, destroying their models.
    clearCompleted: function() {
      _.each(Todos.done(), function(todo){ todo.clear(); });
      return false;
    },

    toggleAllComplete: function () {
      var done = this.allCheckbox.checked;
      Todos.each(function (todo) { todo.save({'done': done}); });
    }

  });

// Finally, we kick things off by creating the App.
  var App = new AppView;

});
