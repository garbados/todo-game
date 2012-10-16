// CONTROLLERS

var routes = {
  index: function(req, res) {res.render('index')},
  dev: function(req, res) {res.render('dev.jade')}
}

for (var attrname in routes) { exports[attrname] = routes[attrname]; }