let sanitizeHTML = require('sanitize-html')

let express = require('express')
let app = express()
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(express.static('public'))

let mongodb = require('mongodb')
let db

let port = process.env.PORT
if (port == null || port == "") {
  port = 3000
}

let connectionString = 'mongodb+srv://testSilencer:6DXwK4XYT64p*xy@cluster0.irn8a.mongodb.net/TodoApp?retryWrites=true&w=majority'  //from mongodb
mongodb.connect(
    connectionString,
    {useNewUrlParser: true, useUnifiedTopology: true}, 
    function(err, client) {
        db = client.db()
        app.listen(port)  //this is moved here to ensure db connection established b4 running it.
    })


function passwordProtected(req,res, next) {
  res.set('WWW-Authenticate', 'Basic realm="Simple Todo App"')  //HTTP basic!!! :p
  console.log(req.headers.authorization)  //logging the encoded user/pass value...
  if (req.headers.authorization == "Basic dGVzdDp0ZXN0") { // Basic EXPECTED_encoded_auth_hash
    next()  //chain up to the next function in the app.get call 
  } else {
    res.status(401).send("Authentication required")
  }
}
  
app.use(passwordProtected)  //an easier way to insert this call as the 2nd arg, applies to all the app.get methods below!

app.get('/', function(req, res){  
  db.collection('items').find().toArray(function(err, items) {
    res.send(`
  <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simple To-Do App</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
</head>
<body>
  <div class="container">
    <h1 class="display-4 text-center py-1">To-Do App</h1>
    
    <div class="jumbotron p-3 shadow-sm">
      <form id="create-form" action="/create-item" method="POST">
        <div class="d-flex align-items-center">
          <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
          <button class="btn btn-primary">Add New Item</button>
        </div>
      </form>
    </div>
    
    <ul id="item-list" class="list-group pb-5"></ul>
    
  </div>
  
<script>
let items = ${JSON.stringify(items)}
</script>

<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
<script src="/browser.js"></script>
</body>
</html>
  `)
  })
})

app.post('/create-item', function(req, res){
  let safeText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: []})
  db.collection('items').insertOne({text: safeText}, function(err, info) {
    res.json(info.ops[0])  
  })
})

app.post('/update-item', function(req, res){
  let safeText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: []})
  //talk to db to update the record
  db.collection('items').findOneAndUpdate({_id: new mongodb.ObjectID(req.body.id)}, {$set: {text: safeText}}, function(){
    res.send("success!")
  })
})

app.post('/delete-item', function(req, res){
  //talk to db to delete the record
  db.collection('items').deleteOne({_id: new mongodb.ObjectID(req.body.id)}, function(){
    res.send("Deleted!")
  })
})





