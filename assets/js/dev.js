var app = app || {};

$(function(){
	/*
	 * MODELS
	 */
	var Todo = Backbone.Model.extend({
		defaults: function() {
			return {
				title: '',
				priority: 5,
				due_date: null,
				done: false,
				done_date: null,
				parent: null,
				children: []
			};
		},

		initialize: function() {
			if (!this.get('priority')) {
				this.set({'priority': this.defaults.priority});
			}
		},

		addChild: function(todo) {
			this.set({
				'children': this.get('children').append(todo),
			});
			todo.set({
				'parent': this
			});
		},

		removeChild: function() {
			/* TODO figure out how this would work */
		},

		// toggle the task's completion.
		toggle: function() {
			if (this.get('done')) {
				this.set({
					'done': this.defaults.done,
					'done_date': this.defaults.done_date
				});
			} else {
				this.set({
					'done': true,
					'done_date': new Date()
				});
			}
		},

		clear: function() {
			this.destroy();
		}
	});
	/*
	 * COLLECTIONS
	 */
	var TodoList = Backbone.Model.extend({
		model: Todo,
		localStorage: new Store("todogame"),

	    done: function() {
	      return this.filter(function(todo){ return todo.get('done'); });
	    },

		// Filter down the list to only todo items that are still not finished.
	    remaining: function() {
	      return this.without.apply(this, this.done());
	    },

		// this.TodoList are sorted by the days until their due date, if they have one, or their priority, if they don't.
		// TODO: Only sorts on refresh and when adding items. Editing items does not reposition them. Fix this.
	    comparator: function(todo) {
	    	var due_date = todo.get('due_date') && new Date(todo.get('due_date'));
	      	if (due_date) {
	      		var now = new Date();
	      		return Math.round((due_date - now)/1000/60/60/24);
		    } else {
	    	  	return todo.get('priority');
	      	}
	    }
	});
	/*
	 * VIEWS
	 */
	// view for a single todo
	var TodoView = Backbone.Model.extend({
    	template: _.template($('#item-template').html()),
	    events: {
	      "click .toggle"   : "toggleDone",
	      "dblclick .view"  : "edit",
	      "click .destroy" : "clear",
	      "keypress .edit"  : "updateOrCancel",
	    },

	    initialize: function() {
	      this.model.on( 'change', this.render, this );
	      this.model.on( 'destroy', this.remove, this );
	      this.model.on( 'visible', this.toggleVisible, this);
	    },

	    render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			this.$el.toggleClass('done', this.model.get('done'));
			this.task = this.$('.task > .edit');
			this.priority = this.$('.priority > .edit');
			this.date = this.$('.due-date > .edit');
			return this;
	    },
	    toggleVisible: function() {
      		this.$el.toggleClass( 'hidden',  this.isHidden());
	    },
	    isHidden: function() {
			var isCompleted = this.model.get('done');
			return (
				(!isCompleted && app.TodoFilter === 'completed')
				|| (isCompleted && app.TodoFilter === 'active')
			);
	    },
	    toggleDone: function() {
	    	this.model.toggle();
	    },
	    // edits the specific field clicked, while applying 'editing' to the parent element
	    edit: function() {
			var ev_class = $(event.target).parent().attr('class');
			this.$el.addClass("editing");
			this.$("." + ev_class.split(' ').join('.') + " input").focus();
	    },
	    // destroy the model and remove it
	    clear: function() {
	    	if (confirm("Are you sure you want to delete this task?")) {
				this.model.clear();
	    	}
	    },
	    updateOrCancel: function(e) {
	    	if (e.keycode == 13) { // ENTER; update
				var new_task = this.task.val();
				if (!new_task) this.clear();
				this.model.save({
					title: new_task,
					priority: this.priority.val(),
					due_date: this.date.val()
				});
				this.$el.removeClass("editing");
	    	} else {
	    		if (e.keycode == 27) { // ESC; cancel
					this.$el.removeClass("editing");
	    		}
	    	}
	    },
	    addChild: function() {
	    	/* figure out how to do this */
	    }

	});

	// view for the whole list of todos
	var ListView = Backbone.Model.extend({
		el: $('#todo-list'),
		events : {
			"keypress #new-todo":  "createOnEnter",
		},
		initialize: function(options) {
			this.TodoList = (options && options.TodoList) || new TodoList();

			this.todos = $('#todos');
			this.title = this.$('#new-todo .title')
			this.priority = this.$("#new-todo .priority");
			this.due_date = this.$("#new-todo .due-date");

			this.TodoList.bind('add', this.addOne, this);
			this.TodoList.bind('reset', this.addAll, this);
			this.TodoList.bind('all', this.render, this);
			this.TodoList.bind('change:completed', this.filterOne, this);
			this.TodoList.bind("filter", this.filterAll, this);

			this.TodoList.fetch();
		},
		render: function() {
			
		},
		addOne: function(todo) {
			var view = new TodoView({model: todo});
			var index = this.TodoList.indexOf(todo);
			var selector = this.$("#todos li:eq(" + index.toString() + ")")
			if (selector) {
				selector.after(view.render().el);
			} else {
				this.todos.append(view.render().el);
			}
		},
		addAll: function() {
      		this.TodoList.each(this.addOne);
		},
		filterOne: function(todo) {
			todo.trigger('visible');
		},
		filterAll: function() {
			this.TodoList.each(this.filterOne, this);
		},
		createOnEnter: function(e) {
			if (e.keyCode != 13) return;
			if (!this.input.val()) return;

			this.TodoList.create({
				title: this.title.val(),
				due_date: this.due_date.val(),
				priority: this.due_date.val() ? null : this.priority.val() || Todo.prototype.defaults().priority
			});
			this.input.val('');
			this.due_date.val('');
			this.priority.val('');
		},

	});

	// feedback view
	var FeedbackView = Backbone.Model.extend({

	});

	/*
	 * ROUTES
	 */
	var Router = Backbone.Model.extend({

	});

	/*
	 * Assign to app and get rolling!
	 */
	app.ListView = new ListView();
	app.FeedbackView = new FeedbackView();
	app.Router = new Router();
});