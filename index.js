const sqlite3 = require('sqlite3');
const express = require("express");
var app = express();
var cors = require('cors');
app.use(express.json());
app.use(cors());

const HTTP_PORT = 8000
app.listen(HTTP_PORT, () => {
    console.log("Server is listening on port " + HTTP_PORT);
});

const db = new sqlite3.Database('./items.db', (err) => {
    if (err) {
        console.error("Erro opening database " + err.message);
    } else {

        db.run('CREATE TABLE listitems( \
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,\
            title NVARCHAR(20)  NOT NULL,\
            release_date NVARCHAR(20)  NOT NULL\
        )', (err) => {
            if (err) {
                console.log("Table already exists.");
            }
            // let insert = 'INSERT INTO listitems (title, release_date) VALUES (?,?)';
            // db.run(insert, ["carrot", "false"]);
            // db.run(insert, ["apples", "false"]);
            // db.run(insert, ["oats", "false"]);
        });
    }
});

app.get("/", (req, res) => {
    res.send("Hello, this is just an sqlite api");
});

app.get("/listitems/:id", (req, res, next) => {
    var params = [req.params.id]
    db.get("SELECT * FROM listitems where id = ?", [req.params.id], (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.status(200).json(row);
    });
});

app.get("/listitems", (req, res, next) => {
    db.all("SELECT * FROM listitems Order by release_date ASC", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.status(200).json({ rows });
    });
});

app.post("/listitems/", (req, res, next) => {
    var reqBody = req.body;
    db.run("INSERT INTO listitems (title, release_date) VALUES (?,?)",
        [reqBody.title, reqBody.release_date],
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": err.message })
                return;
            }
            res.status(201).json({
                "id": this.lastID
            })
        });
});

// app.patch("/listitems/", (req, res, next) => {
//     var reqBody = req.body;
//     db.run(`UPDATE listitems SET title = ?, release_date = ? WHERE id = ?`,
//         [reqBody.title, reqBody.release_date, reqBody.id],
//         function (err, result) {
//             if (err) {
//                 res.status(400).json({ "error": res.message })
//                 return;
//             }
//             res.status(200).json({ updatedID: this.changes });
//         });
// });

app.patch('/listitems/:id', function (req, res, next) {
    const { title } = req.body;
    const id = req.params.id;
  
    db.run('update listitems set title=? where id=?', title, id, function (err) {
      if (err) {
        console.error('Error updating data:', err);
        res.status(500).end();
        return;
      }
  
      const date = new Date().toISOString();
  
      res.send({updated: date})
      res.end();
    });
  })

  app.patch('/listitemscheck/:id', function (req, res, next) {
    const { release_date } = req.body;
    const id = req.params.id;
  
    db.run('update listitems set release_date=? where id=?', release_date, id, function (err) {
      if (err) {
        console.error('Error updating data:', err);
        res.status(500).end();
        return;
      }
  
      const date = new Date().toISOString();
  
      res.send({updated: date})
      res.end();
    });
  })

app.delete("/listitems/:id", (req, res, next) => {
    db.run(`DELETE FROM listitems WHERE id = ?`,
        req.params.id,
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.status(200).json({ deletedID: this.changes })
        });
});