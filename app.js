const express = require('express')
const app = express();
const Cat = require('./models/Cat');
const CatIMAP = require('./models/DataStore/CatIMAP.js').instance();
const firebase = require('./firebase.js');
const _ = require('underscore');
const latToMilesMultiplier = 69;
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
});

app.post('/createCatQueue', (req, res) => {
  var monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth()-1); //Get only from past month
  var lastUpdate = monthAgo.valueOf();
  //Bound the location
  var limitLatN = req.body.location.latitude + 10/latToMilesMultiplier;
  var limitLatS = req.body.location.latitude - 10/latToMilesMultiplier;
  var limitLonE = req.body.location.longitude + 10/latToMilesMultiplier;
  var limitLonW = req.body.location.longitude - 10/latToMilesMultiplier;
  firebase.collection('queues').doc(req.body.id).get()
  .then(result => {
    if(result.data().timestamp) {
      lastUpdate = result.data().timestamp.valueOf();
    }
  })
  .then(() => {
    firebase.collection('cats')
    .orderBy('timestamp', 'desc')
    .where('timestamp', '>', lastUpdate)
    .get()
    .then(result => result.docs)
    .then(docs => docs.filter(doc => {
      location = doc.data().location;
      return location.latitude > limitLatS &&
        location.latitude < limitLatN &&
        location.longitude > limitLonW &&
        location.longitude < limitLonE
    }))
    .then(filtered => {
      var catIds = []
      filtered.forEach(doc =>  {
        catIds.push(doc.id);
      });
      console.log(catIds);
      firebase.collection('queues').doc(req.body.id).set({
        queue: catIds,
        timestamp: lastUpdate
      })
      .then(() => res.send('OK'));
    });
  });
});

app.post('/nextCat', (req, res) => {
  firebase.collection('queues').doc(req.body.id).get()
  .then(doc => {
    //Fetch the queue
    var queue = doc.data().queue;
    if(queue.length === 0) {
      res.send('No more cats');
    }
    catId = queue.pop();
    console.log(catId);
    CatIMAP.get(catId).then(
      cat => {
        var newQueueTimestamp = cat.timestamp;
        firebase.collection('queues').doc(req.body.id).set({
          queue: queue,
          timestamp: newQueueTimestamp
        })
        .then(res.json({
          id: catId,
          photo: cat.photo,
          rating: cat.rating
        }));
      });
  });
});

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
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));
