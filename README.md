todo-game
=========

An attempt to gamify getting stuff done.

## Models

### User

Our user model, used for auth, etc.

### Task

An item on the todo list. May live inside other tasks as a subtask.

#### Fields

* User: ref to instance of User model (if nil, is template for meta-tasks)
* Title
* Category: ref to instance of Category model
* Subtasks: array of other task models
* Priority: integer value, used for sorting
* Due Date: date, used for sorting.

#### Methods

get_order(): returns the number of days until the due date, if the instance has a due date. Else, returns priority.

### Category

Tasks fall under categories, such as "Exercise", "Home", "Community", etc. They are user-defined, though we may want example categories to start with.

#### Fields

* User: ref to instance of User model
* Title
* Description

## Post-MVP Models

### Template

A meta-task that spawns a custom task based on a template. Ex: the workflow for what to do when you get a sales lead.

### Habit

A task that requires completion X times over Y period.

### Routine

A meta-task that spawns a task every X days.