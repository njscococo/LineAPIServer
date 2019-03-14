// const http = require('http');

// const hostname = '127.0.0.1';
// const port = 3000;

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   res.end('Hello, World!\n');
// });

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

const db = require('./query');

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/',(req, res)=>{
  res.json({info: 'hihi'})
});
app.post('/users', db.insertImage);

app.listen(port,()=>{
  console.log('app is working')
});