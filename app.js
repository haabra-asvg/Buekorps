const express = require('express');
const colors = require('colors');
const db = require('better-sqlite3')('database.db');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const app = express();
const showLog = true;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get('/registrer', (req, res) => {
  res.sendFile(__dirname + "/login/registrer.html");
});

app.get('/logg-inn', (req, res) => {
  res.sendFile(__dirname + "/login/logg-inn.html");
});

app.get('/json/users', (req, res) => {
  const selectStatement = db.prepare("SELECT id, name, email, rolle FROM users");
  const users = selectStatement.all();
  res.send(users);
});

app.get('/admin/users', (req, res) => {
  res.sendFile(__dirname + "/admin/users.html");
});

app.post('/post/registrer', (req, res) => {
  const {name, email, password} = req.body;
  const insertStatement = db.prepare("INSERT INTO users (name, email, rolle, password) VALUES (?, ?, ?, ?)");
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log(hashedPassword);
  const insert = insertStatement.run(name, email, "medlem", hashedPassword);
  if(insert) {
    res.redirect("/");
  }
});

app.post('/post/login', (req, res) => {
  const { email, password } = req.body;
  const selectStatement = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?");
  const user = selectStatement.get(email, password);
  if(user) {
    res.cookie("user", user.email, { maxAge: 30 * 24 * 60 * 60 * 1000, path: '/' });
    res.redirect("/");
  } else {
    res.send("Invalid email or password");
  }
});

app.post('/post/delete', (req, res) => {
  const insert = db.exec("DELETE FROM users");
  if(req.cookies.user) {
    res.clearCookie("user");
  }
  if(insert) {
    res.redirect("/");
  }
});

app.post('/post/checkCookie', (req, res) => {
  const user = req.cookies.user;
  console.log(user);
})

app.listen('3000', () => {
  if(showLog) console.log("[" + colors.brightRed.bold("PORT") + "] Listening on PORT 3000");
});