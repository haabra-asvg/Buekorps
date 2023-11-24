const express = require("express");
const colors = require("colors");
const db = require("better-sqlite3")("database.db");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const app = express();
const showLog = true;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/registrer", (req, res) => {
  res.sendFile(__dirname + "/login/registrer.html");
});

app.get("/logg-inn", (req, res) => {
  res.sendFile(__dirname + "/login/logg-inn.html");
});

app.get('/admin/rediger-bruker/:id', (req, res) => {
  const getCookie = req.cookies.user;
  const selectStatement = db.prepare("SELECT * FROM users WHERE email = ?");
  const user = selectStatement.get(getCookie);
  if(user.rolle != "admin") return res.send("Du har ikke tilgang til denne siden!");
  res.sendFile(__dirname + "/admin/rediger-bruker.html");
});

app.get("/json/users", (req, res) => {
  const selectStatement = db.prepare(
    "SELECT id, name, email, rolle FROM users"
  );
  const users = selectStatement.all();
  res.send(users);
});

app.get('/admin/brukere', (req, res) => {
  const getCookie = req.cookies.user;
  if(!getCookie) return res.send("Du må logge inn for å se denne siden!");
  const selectStatement = db.prepare("SELECT * FROM users WHERE email = ?");
  const user = selectStatement.get(getCookie);
  if(user.rolle != "admin") return res.send("Du har ikke tilgang til denne siden!");
  res.sendFile(__dirname + "/admin/brukere.html");
});

app.get("/leder/brukere", (req, res) => {
  const getCookie = req.cookies.user;
  if(!getCookie) return res.send("Du må logge inn for å se denne siden!");
  const selectStatement = db.prepare("SELECT * FROM users WHERE email = ?");
  const user = selectStatement.get(getCookie);
  if(user.rolle === "medlem") return res.send("Du har ikke tilgang til denne siden!");
  res.sendFile(__dirname + "/leder/brukere.html");
})

app.post("/post/registrer", (req, res) => {
  const { name, email, password } = req.body;
  const insertStatement = db.prepare(
    "INSERT INTO users (name, email, rolle, password) VALUES (?, ?, ?, ?)"
  );
  const hashedPassword = bcrypt.hashSync(password, 10);
  const insert = insertStatement.run(name, email, "admin", hashedPassword);
  if (insert) {
    res.redirect("/");
  }
});

app.post("/post/login", (req, res) => {
  const { email, password } = req.body;
  const selectStatement = db.prepare("SELECT * FROM users WHERE email = ?");
  const user = selectStatement.get(email);
  if (!user) return res.send("Invalid email or password!");
  verifyUser(user, password, res);
});

app.post("/post/redigerBruker", (req, res) => {
  const { id, name, email, rolle } = req.body;

  const selectStatement = db.prepare("SELECT * FROM users WHERE id = ?");
  const user = selectStatement.get(id);

  if (name != user.name) {
    const updateStatement = db.prepare("UPDATE users SET name = ? WHERE id = ?");
    updateStatement.run(name, id);
  }

  if (email != user.email) {
    const updateStatement = db.prepare("UPDATE users SET email = ? WHERE id = ?");
    updateStatement.run(email, id);
  }

  if (rolle != user.rolle) {
    if(rolle != "velg") {
      const updateStatement = db.prepare("UPDATE users SET rolle = ? WHERE id = ?");
      updateStatement.run(rolle, id);
    }
  }

  res.redirect("/");
});

app.post("/post/slettBruker/:id", (req, res) => {
  const id = req.params.id;
  const userEmail = req.cookies.user;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(userEmail);
  if(user.id == id) {
    return res.send("Du kan ikke slette deg selv!");
  }
  const deleteStatement = db.prepare("DELETE FROM users WHERE id = ?");
  deleteStatement.run(id);
  res.redirect("/admin/brukere");
});

app.post("/post/delete", (req, res) => {
  const insert = db.exec("DELETE FROM users");
  if (req.cookies.user) {
    if (showLog)
      console.log("[" + colors.red.bold("LOGIN") + "] Database wiped!");
    res.clearCookie("user");
  }
  if (insert) {
    res.redirect("/");
  }
});

app.post("/post/slettBruker/:id", (req, res) => {
  const id = req.params.id;
  const userEmail = req.cookies.user;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(userEmail);
  if(user.id == id) {
    return res.send("Du kan ikke slette deg selv!");
  }
  const deleteStatement = db.prepare("DELETE FROM users WHERE id = ?");
  deleteStatement.run(id);
  res.redirect("/admin/brukere");
});

app.post('/post/checkCookie', (req, res) => {
  const user = req.cookies.user;
  if (showLog)
    console.log("[" + colors.green.bold("CHECK COOKIE") + "] " + user);
});

app.post("/post/dropTable", (req, res) => {
  const drop = db.exec("DROP TABLE users");
  if (drop) {
    res.redirect("/");
  }
});

app.post("/post/loggUt", (req, res) => {
  res.clearCookie("user");
  res.redirect("/");
});

function verifyUser(user, password, res) {
  const match = bcrypt.compareSync(password, user.password);
  if (!match) {
    return res.send("Invalid email or password!");
  } else {
    res.cookie("user", user.email, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    if (showLog)
      console.log("[" + colors.yellow.bold("LOGIN") + "] User logged in!");
    res.redirect("/");
  }
}

app.listen("3000", () => {
  if (showLog)
    console.log(
      "[" + colors.brightRed.bold("PORT") + "] Listening on PORT 3000"
    );
});
