const express = require('express')
const app = express();
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
  cat.timestamp = (new Date()).toString();
  var newCat = new Cat(cat);
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

app.get('/test', (req, res) => {
    var watson = require('watson-developer-cloud');
    var fs = require('fs');
    var visual_recognition = watson.visual_recognition({
        api_key: 'bdf9326b6cd13105cb2a913109426d83214c3b87',
        version: 'v3',
        version_date: '2016-05-20'
    });

    let parameters = {
      classifier_ids: ["explicit","default"],
      threshold: 0.6
    };

    var params = {
      images_file: fs.createReadStream('./cat.jpg'),
      parameters: parameters
    };

    visual_recognition.classify(params, function(err, response) {
      if (err)
        console.log(err);
      else
        console.log(JSON.stringify(response, null, 2));
        // let response = JSON.stringify(response, null, 2);
        // console.log(response.images.classfiers[0].classes)
    });
        res.send('bye world');
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))
