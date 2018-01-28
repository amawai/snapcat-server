const express = require('express')
const app = express()
const rootPath = require('app-root-dir').get();
const CatVerification = require(rootPath + '/watson.js');
let verifyCat = new CatVerification();
const Cat = require('./models/Cat');
const CatIMAP = require('./models/DataStore/CatIMAP.js').instance();
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json
app.get('/', (req, res) => res.send('Hello World!'))

/* Expect request in the form:
  {
      location: {
        longitude: number,
        latitude: number
      },
      photo: base 64 string,
      submited_by: string,
  }
*/
app.post('/submitCat', (req, res) => {
  var cat = req.body;
  cat.timestamp = Date.now();
  var newCat = new Cat(cat);
  newCat.timestamp_string = cat.timestamp.toString();
  newCat.save()
  .then(obj => {
      CatIMAP.add(obj);
      res.send('OK');
    })
  .catch(() => res.error(400));
});

app.post('/upvoteCat', (req, res) => {
  CatIMAP.get(req.body.id).then(cat => {
    cat.upVote();
    cat.save()
    .then(() => res.send('OK'))
    .catch(() => res.error('Not found cat'));
  })
})

 
app.get('/cat', (req, res) => {
  verifyCat.verifyIfCat('./cat.jpg');
  res.send('ok!');
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))
