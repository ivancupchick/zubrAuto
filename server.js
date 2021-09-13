const express = require('express');
const bodyParser = require("body-parser");
const mysql = require("mysql2");

// server variables
const app = express();
const port = 3080;
const connection = mysql.createConnection({
  host: "localhost",
  user: "root1",
  database: "main",
  password: "root"
});

connection.connect(function(err){
  if (err) {
    return console.error("Ошибка: " + err.message);
  }
  else{
    console.log("Подключение к серверу MySQL успешно установлено");
  }
});

const users = [];

app.use(bodyParser.json());
app.use(express.static(process.cwd()+"/ui/dist/zubr-auto/"));

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/user', (req, res) => {
  const user = req.body.user;
  users.push(user);
  res.json("user addedd");
});

app.get('/', (req,res) => {
  res.sendFile(process.cwd()+"/ui/dist/zubr-auto/index.html")
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});
