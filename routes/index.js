// CONTROLLERS

var routes = {
  index: function(req, res) {res.render('index')}
}

for (var attrname in routes) { exports[attrname] = routes[attrname]; }