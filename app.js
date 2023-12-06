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
app.set('view engine', 'ejs');

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
    "SELECT id, name, email, rolle, tlf, bataljon, kompani FROM users"
  );
  const users = selectStatement.all();
  res.send(users);
});

app.get("/json/bataljoner", (req, res) => {
  const selectStatement = db.prepare("SELECT * FROM bataljon");
  const users = selectStatement.all();
  res.send(users);
})

app.get("/json/kompanier", (req, res) => {
  const selectStatement = db.prepare("SELECT * FROM kompani");
  const users = selectStatement.all();
  res.send(users);
});

app.get("/admin", (req, res) => {
  const getCookie = req.cookies.user;
  if(!getCookie) return res.send("Du må logge inn for å se denne siden!");
  const selectStatement = db.prepare("SELECT * FROM users WHERE email = ?");
  const user = selectStatement.get(getCookie);
  if(user.rolle != "admin") return res.send("Du har ikke tilgang til denne siden!");
  res.sendFile(__dirname + "/admin/index.html");
});

app.get("/admin/kompanier", (req, res) => {
  const getCookie = req.cookies.user;
  if(!getCookie) return res.send("Du må logge inn for å se denne siden!");
  const selectStatement = db.prepare("SELECT * FROM users WHERE email = ?");
  const user = selectStatement.get(getCookie);
  if(user.rolle != "admin") return res.send("Du har ikke tilgang til denne siden!");
  res.sendFile(__dirname + "/admin/kompanier.html");
});

app.get("/admin/bataljoner", (req, res) => {
  const getCookie = req.cookies.user;
  if(!getCookie) return res.send("Du må logge inn for å se denne siden!");
  const selectStatement = db.prepare("SELECT * FROM users WHERE email = ?");
  const user = selectStatement.get(getCookie);
  if(user.rolle != "admin") return res.send("Du har ikke tilgang til denne siden!");
  res.sendFile(__dirname + "/admin/bataljoner.html");
});

app.get('/admin/brukere', (req, res) => {
  const getCookie = req.cookies.user;
  if(!getCookie) return res.send("Du må logge inn for å se denne siden!");
  const selectStatement = db.prepare("SELECT * FROM users WHERE email = ?");
  const user = selectStatement.get(getCookie);
  if(user.rolle != "admin") return res.send("Du har ikke tilgang til denne siden!");
  res.sendFile(__dirname + "/admin/brukere.html");
});

app.get("/admin/createBataljon", (req, res) => {
  const getCookie = req.cookies.user;
  if(!getCookie) return res.send("Du må logge inn for å se denne siden!");
  const selectStatement = db.prepare("SELECT * FROM users WHERE email = ?");
  const user = selectStatement.get(getCookie);
  if(user.rolle != "admin") return res.send("Du har ikke tilgang til denne siden!");
  res.sendFile(__dirname + "/admin/create-bataljon.html");
});

app.post("/post/createBataljon", (req, res) => {
  const { bataljon_id, name } = req.body;
  const insertStatement = db.prepare("INSERT INTO bataljon (bataljon_id, name, medlemmer) VALUES (?, ?, ?)");
  const insert = insertStatement.run(bataljon_id, name, 0);
  if(insert) {
    res.redirect("/admin/bataljoner");
  }
});

app.get("/admin/createKompani", (req, res) => {
  const getCookie = req.cookies.user;
  if(!getCookie) return res.send("Du må logge inn for å se denne siden!");
  const selectStatement = db.prepare("SELECT * FROM users WHERE email = ?");
  const user = selectStatement.get(getCookie);
  if(user.rolle != "admin") return res.send("Du har ikke tilgang til denne siden!");
  res.sendFile(__dirname + "/admin/create-kompani.html");
});

app.post("/post/createKompani", (req, res) => {
  const { name, bataljon, leder } = req.body;
  if(bataljon == "velg") return res.send("Du må velge en bataljon!");
  if(leder == "velg") {
    const insertStatement = db.prepare("INSERT INTO kompani (name, bataljon_id, medlemmer) VALUES (?, ?, ?)");
    const insert = insertStatement.run(name, bataljon, 0);
    if(insert) {
      res.redirect("/admin/kompanier");
    }
  } else {
    const insertStatement = db.prepare("INSERT INTO kompani (name, bataljon_id, leder, medlemmer) VALUES (?, ?, ?, ?)");
    const insert = insertStatement.run(name, bataljon, leder, 1);
    const updateStatement = db.prepare("UPDATE users SET (rolle, kompani) = (?, ?) WHERE id = ?");
    const getKompani = db.prepare("SELECT * FROM kompani WHERE leder = ?");
    const kompani = getKompani.get(leder);
    updateStatement.run("leder", kompani.kompani_id, leder);
    if(insert) {
      res.redirect("/admin/kompanier");
    }
  }
});

app.get("/admin/updateKompani/:id", (req, res) => {
  const getCookie = req.cookies.user;
  if(!getCookie) return res.send("Du må logge inn for å se denne siden!");
  const selectStatement = db.prepare("SELECT * FROM users WHERE email = ?");
  const user = selectStatement.get(getCookie);
  if(user.rolle != "admin") return res.send("Du har ikke tilgang til denne siden!");
  res.sendFile(__dirname + "/admin/update-kompani.html");
});

app.post("/post/updateKompani", (req, res) => {
  const { id, name, bataljon, leder } = req.body;

  const selectStatement = db.prepare("SELECT * FROM kompani WHERE kompani_id = ?");
  const kompani = selectStatement.get(id);

  if (name != kompani.name) {
    const updateStatement = db.prepare("UPDATE kompani SET name = ? WHERE kompani_id = ?");
    updateStatement.run(name, id);
  }

  if (bataljon != kompani.bataljon_id) {
    if(bataljon != "velg") {
      const updateStatement = db.prepare("UPDATE kompani SET bataljon_id = ? WHERE kompani_id = ?");
      updateStatement.run(bataljon, id);
    }
  }

  if (leder != kompani.leder) {

    // OLD LEADER
    const getLeaderStatement = db.prepare("SELECT * FROM users WHERE rolle = 'leder' AND kompani = ?");
    const getLeader = getLeaderStatement.get(id);
    if(getLeader) {
      const removeLeader = db.prepare("UPDATE users SET rolle = ? WHERE id = ?");
      removeLeader.run("medlem", getLeader.id);
    }

    // NEW LEADER
    if(leder == "velg") {
      const updateStatement = db.prepare("UPDATE kompani SET leder = ? WHERE kompani_id = ?");
      updateStatement.run(undefined, id);
    } else {
      const updateStatement = db.prepare("UPDATE kompani SET leder = ? WHERE kompani_id = ?");
      updateStatement.run(leder, id);
      const addLeader = db.prepare("UPDATE users SET rolle = ? WHERE id = ?");
      addLeader.run("leder", leder);
    }
  }

  res.redirect("/admin/kompanier");
});

app.post("/post/slettKompani/:id", (req, res) => {
  const id = req.params.id;

  const selectStatement = db.prepare("SELECT * FROM users");
  const users = selectStatement.all();

  users.forEach(user => {
    if(user.kompani == id) {
      const setStatement = db.prepare("UPDATE users SET kompani = ? WHERE id = ?");
      setStatement.run(undefined, user.id);
      if(user.rolle == "leder") {
        const setStatement = db.prepare("UPDATE users SET rolle = ? WHERE id = ?");
        setStatement.run("medlem", user.id);
      }
    }
  });

  const deleteStatement = db.prepare("DELETE FROM kompani WHERE kompani_id = ?");
  deleteStatement.run(id);

  res.redirect("/admin/kompanier");
});

app.get("/admin/updateBataljon/:id", (req, res) => {
  const getCookie = req.cookies.user;
  if(!getCookie) return res.send("Du må logge inn for å se denne siden!");
  const selectStatement = db.prepare("SELECT * FROM users WHERE email = ?");
  const user = selectStatement.get(getCookie);
  if(user.rolle != "admin") return res.send("Du har ikke tilgang til denne siden!");
  res.sendFile(__dirname + "/admin/update-bataljon.html");
});

app.post("/post/updateBataljon", (req, res) => {
  const { id, name } = req.body;

  const selectStatement = db.prepare("SELECT * FROM bataljon WHERE bataljon_id = ?");
  const bataljon = selectStatement.get(id);

  if (name != bataljon.name) {
    const updateStatement = db.prepare("UPDATE bataljon SET name = ? WHERE bataljon_id = ?");
    updateStatement.run(name, id);
  }

  res.redirect("/admin/bataljoner");
});

app.post("/post/slettBataljon/:id", (req, res) => {
  const id = req.params.id;

  const selectStatement = db.prepare("SELECT * FROM users");
  const users = selectStatement.all();

  users.forEach(user => {
    if(user.bataljon == id) {
      const setStatement = db.prepare("UPDATE users SET bataljon = ? WHERE id = ?");
      setStatement.run(undefined, user.id);
      if(user.kompani != undefined) {
        const setStatement = db.prepare("UPDATE users SET kompani = ? WHERE id = ?");
        setStatement.run(undefined, user.id);
      }
      if(user.rolle == "leder") {
        const setStatement = db.prepare("UPDATE users SET rolle = ? WHERE id = ?");
        setStatement.run("medlem", user.id);
      }
    }
  });

  const deleteStatement = db.prepare("DELETE FROM bataljon WHERE bataljon_id = ?");
  deleteStatement.run(id);

  res.redirect("/admin/bataljoner");
});

app.get("/leder/brukere", (req, res) => {
  const getCookie = req.cookies.user;
  if(!getCookie) return res.send("Du må logge inn for å se denne siden!");
  const selectStatement = db.prepare("SELECT * FROM users WHERE email = ?");
  const getUser = selectStatement.get(getCookie);
  if(getUser.rolle === "medlem") return res.send("Du har ikke tilgang til denne siden!");
  res.render('brukere', { user: getUser });
});

app.post("/post/sparkMedlem/:id", (req, res) => {
  const id = req.params.id;
  const userEmail = req.cookies.user;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(userEmail);
  if(user.id == id) {
    return res.send("Du kan ikke slette deg selv!");
  }
  const getUserStatement = db.prepare("SELECT * FROM users WHERE id = ?");
  const getUser = getUserStatement.get(id);
  const getKompaniStatement = db.prepare("SELECT * FROM kompani WHERE kompani_id = ?");
  const getKompani = getKompaniStatement.get(getUser.kompani);
  const updateMembersStatement = db.prepare("UPDATE kompani SET medlemmer = ? WHERE kompani_id = ?");
  updateMembersStatement.run(getKompani.medlemmer - 1, getKompani.kompani_id);
  const deleteStatement = db.prepare("UPDATE users SET kompani = ? WHERE id = ?");
  deleteStatement.run(undefined, id);
  res.redirect("/leder/brukere");
});

app.get("/medlem/profil", (req, res) => {
  const getCookie = req.cookies.user;
  if(!getCookie) return res.send("Du må logge inn for å se denne siden!");
  const selectStatement = db.prepare("SELECT * FROM users WHERE email = ?");
  const getUser = selectStatement.get(getCookie);
  res.render('profil', { user: getUser });
});

app.get("/medlem/redigerProfil", (req, res) => {
  const getCookie = req.cookies.user;
  if(!getCookie) return res.send("Du må logge inn for å se denne siden!");
  const selectStatement = db.prepare("SELECT * FROM users WHERE email = ?");
  const getUser = selectStatement.get(getCookie);
  res.render('redigerProfil', { user: getUser });
});

app.post("/post/medlem/redigerBruker", (req, res) => {
  const { name, epost, tlf } = req.body;
  const getCookie = req.cookies.user;
  const selectStatement = db.prepare("SELECT * FROM users WHERE email = ?");
  const user = selectStatement.get(getCookie);

  if(name != user.name) {
    const getStatement = db.prepare("SELECT * FROM users WHERE name = ?");
    const checkName = getStatement.get(name);
    if(checkName) return res.send("Dette navnet er allerede i bruk!");
    const updateStatement = db.prepare("UPDATE users SET name = ? WHERE email = ?");
    updateStatement.run(name, getCookie);
  }

  if(epost != user.email) {
    const getStatement = db.prepare("SELECT * FROM users WHERE email = ?");
    const checkEmail = getStatement.get(epost);
    if(checkEmail) return res.send("Denne eposten er allerede i bruk!");
    const updateStatement = db.prepare("UPDATE users SET email = ? WHERE email = ?");
    updateStatement.run(epost, getCookie);
  }

  if(tlf != user.tlf) {
    const updateStatement = db.prepare("UPDATE users SET tlf = ? WHERE email = ?");
    updateStatement.run(tlf, getCookie);
  }

  res.redirect("/medlem/profil");

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
  const { id, name, email, rolle, bataljon, kompani, tlf } = req.body;

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

  if(bataljon != user.bataljon) {
    if(bataljon != "velg") {
      const updateStatement = db.prepare("UPDATE users SET bataljon = ? WHERE id = ?");
      updateStatement.run(bataljon, id);
      const selectStatement = db.prepare("SELECT * FROM bataljon WHERE bataljon_id = ?");
      const bataljonMedlemmer = selectStatement.get(bataljon);
      const updateStatement2 = db.prepare("UPDATE bataljon SET medlemmer = ? WHERE bataljon_id = ?");
      updateStatement2.run(bataljonMedlemmer.medlemmer + 1, bataljon);
      if(user.bataljon != undefined) {
        const selectStatement2 = db.prepare("SELECT * FROM bataljon WHERE bataljon_id = ?");
        const bataljonMedlemmer2 = selectStatement2.get(user.bataljon);
        const updateStatement3 = db.prepare("UPDATE bataljon SET medlemmer = ? WHERE bataljon_id = ?");
        updateStatement3.run(bataljonMedlemmer2.medlemmer - 1, user.bataljon);
      }
    }
  }

  if(kompani != user.kompani) {
    if(kompani != "velg") {
      const updateStatement = db.prepare("UPDATE users SET kompani = ? WHERE id = ?");
      updateStatement.run(kompani, id);
      const selectStatement = db.prepare("SELECT * FROM kompani WHERE kompani_id = ?");
      const kompaniMedlemmer = selectStatement.get(kompani);
      const updateStatement2 = db.prepare("UPDATE kompani SET medlemmer = ? WHERE kompani_id = ?");
      updateStatement2.run(kompaniMedlemmer.medlemmer + 1, kompani);
      if(user.kompani != undefined) {
        const selectStatement2 = db.prepare("SELECT * FROM kompani WHERE kompani_id = ?");
        const kompaniMedlemmer2 = selectStatement2.get(user.kompani);
        const updateStatement3 = db.prepare("UPDATE kompani SET medlemmer = ? WHERE kompani_id = ?");
        updateStatement3.run(kompaniMedlemmer2.medlemmer - 1, user.kompani);
      }
    } else {
      const updateStatement = db.prepare("UPDATE users SET kompani = ? WHERE id = ?");
      updateStatement.run(undefined, id);
      if(user.kompani != undefined) {
        const selectStatement2 = db.prepare("SELECT * FROM kompani WHERE kompani_id = ?");
        const kompaniMedlemmer2 = selectStatement2.get(user.kompani);
        const updateStatement3 = db.prepare("UPDATE kompani SET medlemmer = ? WHERE kompani_id = ?");
        updateStatement3.run(kompaniMedlemmer2.medlemmer - 1, user.kompani);
      }
    }
  }

  if(tlf != user.tlf) {
    const updateStatement = db.prepare("UPDATE users SET tlf = ? WHERE id = ?");
    updateStatement.run(tlf, id);
  }

  res.redirect("/admin/brukere");
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
    res.redirect("/admin/brukere");
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

app.post("/post/dropUsers", (req, res) => {
  const drop = db.exec("DROP TABLE users");
  if (drop) {
    res.redirect("/");
  }
});

app.post("/post/dropBataljon", (req, res) => {
  const drop = db.exec("DROP TABLE bataljon");
  if (drop) {
    res.redirect("/");
  }
});

app.post("/post/dropKompani", (req, res) => {
  const drop = db.exec("DROP TABLE kompani");
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
