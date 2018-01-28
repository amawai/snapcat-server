const firebase = require('firebase');
require('firebase/firestore');
//Yep it's insecure
firebase.initializeApp({
      apiKey: "AIzaSyCjhnfRTwNeGTmuo5o0kqhdEwoJARy5zIc",
      authDomain: "snapcat-f164a.firebaseapp.com",
      databaseURL: "https://snapcat-f164a.firebaseio.com",
      projectId: "snapcat-f164a",
      storageBucket: "snapcat-f164a.appspot.com",
      messagingSenderId: "809558587703"
});


var db = firebase.firestore();

module.exports = db;
