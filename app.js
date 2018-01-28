const express = require('express')
const app = express()

app.get('/', (req, res) => res.send('Hello World!'))

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
