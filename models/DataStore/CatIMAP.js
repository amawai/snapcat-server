/*
  Not quite a true implementation of an identity map. Martin Fowler is sad.
*/

const firebase = require('../../firebase.js');
const Cat = require('../Cat.js');

class CatIMAP {
  constructor() {
    this.objects = {};
  }

  static instance() {
    if(!this._instance) {
      this._instance = new CatIMAP();
    }
    return this._instance;
  }

  add(cat) {
    if(!this.objects[cat.id]) {
      this.objects[cat.id] = cat;
    }
  }

  get(id) {
    return new Promise((resolve, reject) => {
      if(this.objects[id]){
        resolve(this.objects[id]);
      }
      return firebase.collection('cats').doc(id).get()
      .then(res => {
        res = res.data();
        res.id = id;
        var newCat = new Cat(res);
        this.add(newCat);
        resolve(newCat);
      })
      .catch(() => {
        reject();
      });
    });
  }
}

module.exports = CatIMAP;
