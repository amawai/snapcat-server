const firebase = require('../firebase.js');

class Cat {
  /**
   * config:
   * @param id {}
   * @param location {Object}
   * @param location.longitude {number}
   * @param location.lattitude {number}
   * @param rating {number}
   * @param photo {string} - base64 string
   * @param timestamp {Date}
   */
  constructor(config) {
    this.id = config.id;
    this.location = config.location;
    this.rating = config.rating || 0;
    this.photo = config.photo;
    this.timestamp = config.timestamp;
    this.submited_by = config.submited_by;
  }

  save() {
    var catCollection = firebase.collection('cats');
    var catRef;
    if(this.id) {
      catRef = catCollection.doc(this.id);
    } else  {
      catRef = catCollection.doc();
    }
    return catRef.set({
      location: this.location,
      rating: this.rating || 0,
      photo: this.photo,
      timestamp: this.timestamp,
      submited_by: this.submited_by
    }).then(() => {
      this.id = catRef.id;
      return this;
    })
  }

  fetch() {
    if(!this.id) {
      return;
    }
    return firebase.collection('cats').doc(this.id).get()
    .then(res => {
      var data = res.data();
      this.rating = data.rating;
      this.location = data.location;
      this.photo = data.photo; //Decode?
      this.timestamp = data.timestamp;
      this.submited_by = data.submited_by;
    });
  }

  upVote() {
    this.rating += 1;
  }
}

module.exports = Cat;
