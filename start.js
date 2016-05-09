var app = require('./app.js')

app.set('port', (process.env.PORT || 4000));

app.listen(app.get('port'))