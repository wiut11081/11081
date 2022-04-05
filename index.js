const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));


const db_name = path.join(__dirname, "data", "restaurant.db");
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful connection to the database 'restaurant.db'");
});

const sql_create = `CREATE TABLE IF NOT EXISTS Restaurants (
    Restaurant_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name VARCHAR(100) NOT NULL,
    Region VARCHAR(100) NOT NULL,
    Feedback TEXT
  );`;
  
  db.run(sql_create, err => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Successful creation of the 'Restaurant' table");
  
    const sql_insert = `INSERT INTO Restaurants (Restaurant_ID, Name, Region, Feedback) VALUES
    (1, 'Efendi', 'Mirobod', 'Delicious turkish food'),
    (2, 'Bon', 'Mirobod', 'Well designed interiors');`;
  db.run(sql_insert, err => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Successful creation of 2 restaurants");
  });

});

app.listen(3000, () => {
    console.log("Serveur démarré (http://localhost:3000/) !");
});

// GET /
app.get("/", (req, res) => {
  res.render("index");
});

//about
app.get("/about", (req, res) => {
  res.render("about");
});


// restaurants
app.get("/restaurants", (req, res) => {
  const sql = "SELECT * FROM Restaurants ORDER BY Name";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("restaurants", { model: rows });
  });
});

//create
app.get("/create", (req, res) => {
  res.render("create", { model: {} });
});

app.post("/create", (req, res) => {
  const sql = "INSERT INTO Restaurants (Name, Region, Feedback) VALUES (?, ?, ?)";
  const restaurant = [req.body.Name, req.body.Region, req.body.Feedback];
  db.run(sql, restaurant, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/restaurants");
  });
});

//edit
app.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Restaurants WHERE Restaurant_ID = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("edit", { model: row });
  });
});

app.post("/edit/:id", (req, res) => {
  const id = req.params.id;
  const restaurant = [req.body.Name, req.body.Region, req.body.Feedback, id];
  const sql = "UPDATE Restaurants SET Name = ?, Region = ?, Feedback = ? WHERE (Restaurant_ID = ?)";
  db.run(sql, restaurant, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/restaurants");
  });
});

//delete
app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Restaurants WHERE Restaurant_ID = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("delete", { model: row });
  });
});

app.post("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM Restaurants WHERE Restaurant_ID = ?";
  db.run(sql, id, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/restaurants");
  });
});