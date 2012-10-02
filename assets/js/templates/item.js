<div class="view">
	<input class="toggle" type="checkbox" <%= done ? 'checked' : '' %>>
	<label><%- title %></label>
	<button class="destroy"></button>
</div>
<input class="edit" value="<%- title %>">