const express = require('express')
const app = express()
const rootPath = require('app-root-dir').get();
const CatVerification = require(rootPath + '/watson.js');
let cat = new CatVerification();

app.get('/', (req, res) => res.send('Hello World!'))


app.get('/cat', (req, res) => {
  cat.verifyIfCat('./cat.jpg');
  res.send('ok!');
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))
