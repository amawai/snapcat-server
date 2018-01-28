var watson = require('watson-developer-cloud');
var fs = require('fs');

class CatVerification {
    constructor() {
      this.watson = watson;
      this.fs = fs;
      this.visual_recognition = watson.visual_recognition({
          api_key: 'bdf9326b6cd13105cb2a913109426d83214c3b87',
          version: 'v3',
          version_date: '2016-05-20'
      });
      this.parameters = {
        classifier_ids: ["explicit","default"],
        threshold: 0.6
      };
      this.params = {};
    }

    itIsACat(classes) {
      let catScore = 0;
      for (let classType in classes) {
        if (classes[classType].class === 'cat') {
          catScore = classes[classType].score;
        }
      }
      return catScore > 0.7;
    }


    verifyImage(response) {
      let obj = {}
      response.images[0].classifiers.map((x,index) => {obj[x.classifier_id] = index})
      let explicitIndex = obj.explicit;
      let defaultIndex = obj.default;
      let isItExplicit = response.images[0].classifiers[explicitIndex].classes[0].class === 'not explicit';
      let catScore = 0;
      let isItACat = this.itIsACat(response.images[0].classifiers[defaultIndex].classes)
      console.log(isItExplicit && isItACat);
      return isItExplicit && isItACat;
    }


    verifyIfCat(img) {
      this.params = {
        images_file: this.fs.createReadStream(img),
        parameters: this.parameters
      }
      let that = this;
      this.visual_recognition.classify(this.params, (err, response) => {
        if (err) {
          console.log('why why manti');
          console.log(err);
        }
        else {
          // console.log(JSON.stringify(response, null, 2))
          let answer = JSON.stringify(response, null, 2);
          let response2 = JSON.parse(JSON.stringify(response, null, 2));
          this.verifyImage(response2);
        }
      });
    }
}


module.exports = CatVerification;