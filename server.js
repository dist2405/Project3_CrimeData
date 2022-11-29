// Built-in Node.js modules
let fs = require("fs");
let path = require("path");

// NPM modules
let express = require("express");
let sqlite3 = require("sqlite3");

let db_filename = path.join(__dirname, "db", "stpaul_crime.sqlite3");

let app = express();
let port = 8000;
let SQLquery = "";

app.use(express.json());

// Open SQLite3 database (in read-only mode)
let db = new sqlite3.Database(db_filename, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.log("Error opening " + path.basename(db_filename));
  } else {
    console.log("Now connected to " + path.basename(db_filename));
  }
});

// GET request handler for crime codes
app.get("/codes", (req, res) => {
  SQLquery = "SELECT code, incident_type AS type FROM codes ";
  console.log(req.query); // query object (key-value pairs after the ? in the url)
  //need if statement for certain codes
  let params = [];
  clause = "WHERE";
  if (req.query.hasOwnProperty("code")) {
    let codearray = req.query.code.split(",");
    SQLquery = SQLquery + clause + " code IN ( ?";
    //loops through multiple codes
    let i;
    let between = "";
    for (i = 0; i < codearray.length; i++) {
      params.push(parseInt(codearray[i]));
      SQLquery = SQLquery + between;
      between = ",? ";
    }
    console.log(SQLquery);
    SQLquery = SQLquery + ")";
    clause = "AND";
  }
  SQLquery = SQLquery + " ORDER BY code ";
  db.all(SQLquery, params, (err, rows) => {
    res.status(200).type("json").send(rows);
  });
});

// GET request handler for neighborhoods
app.get("/neighborhoods", (req, res) => {
  SQLquery =
    "SELECT neighborhood_number AS id, neighborhood_name as name FROM neighborhoods ";
  console.log(req.query); // query object (key-value pairs after the ? in the url)
  //need if statement for certain codes
  let params = [];
  clause = "WHERE";
  if (req.query.hasOwnProperty("id")) {
    let codearray = req.query.id.split(",");
    SQLquery = SQLquery + clause + " neighborhood_number IN ( ?";
    //loops through multiple codes
    let i;
    let between = "";
    for (i = 0; i < codearray.length; i++) {
      params.push(parseInt(codearray[i]));
      SQLquery = SQLquery + between;
      between = ",? ";
    }
    console.log(SQLquery);
    SQLquery = SQLquery + ")";
    clause = "AND";
  }
  SQLquery = SQLquery + " ORDER BY neighborhood_number ";
  db.all(SQLquery, params, (err, rows) => {
    console.log(err);
    res.status(200).type("json").send(rows);
  });
});

// GET request handler for crime incidents
app.get("/incidents", (req, res) => {
  SQLquery =
    "SELECT case_number, date(date_time) AS date,time(date_time) as time,code, incident, police_grid, neighborhood_number, block FROM Incidents";
  console.log(req.query); // query object (key-value pairs after the ? in the url)
  let RowCount = 1000;
  //need if statement for start/end dates/code/grid/ neighbothood
  let params = [];
  clause = " WHERE ";
  if (req.query.hasOwnProperty("start_date")) {
    SQLquery = SQLquery + clause + " date >= ?";
    params.push(req.query.start_date);
    clause = "AND";
    console.log(SQLquery);
  }
  if (req.query.hasOwnProperty("end_date")) {
    SQLquery = SQLquery + clause + " date <=?";
    params.push(req.query.end_date);
    clause = "AND";
    console.log(SQLquery);
  }
  if (req.query.hasOwnProperty("code")) {
    let codearray = req.query.code.split(",");
    SQLquery = SQLquery + clause + " code IN ( ?";
    //loops through multiple codes
    let i;
    let between = "";
    for (i = 0; i < codearray.length; i++) {
      params.push(parseInt(codearray[i]));
      SQLquery = SQLquery + between;
      between = ",? ";
    }
    console.log(SQLquery);
    SQLquery = SQLquery + ")";
    clause = "AND";
  }
  if (req.query.hasOwnProperty("grid")) {
    let codearray = req.query.grid.split(",");
    SQLquery = SQLquery + clause + " police_grid IN ( ?";
    //loops through multiple codes
    let i;
    let between = "";
    for (i = 0; i < codearray.length; i++) {
      params.push(parseInt(codearray[i]));
      SQLquery = SQLquery + between;
      between = ",? ";
    }
    console.log(SQLquery);
    SQLquery = SQLquery + ")";
    clause = "AND";
  }
  if (req.query.hasOwnProperty("id")) {
    let codearray = req.query.id.split(",");
    SQLquery = SQLquery + clause + " neighborhood_number IN ( ?";
    //loops through multiple codes
    let i;
    let between = "";
    for (i = 0; i < codearray.length; i++) {
      params.push(parseInt(codearray[i]));
      SQLquery = SQLquery + between;
      between = ",? ";
    }
    console.log(SQLquery);
    SQLquery = SQLquery + ")";
    clause = "AND";
  }

  SQLquery = SQLquery + " ORDER BY date_time DESC ";
  //need if statement here for limit
  if (req.query.hasOwnProperty("limit")) {
    SQLquery = SQLquery + "LIMIT ?";
    params.push(req.query.limit);
    console.log(SQLquery);
  }

  if (!req.query.hasOwnProperty("limit")) {
    SQLquery = SQLquery + "LIMIT 1000";
    params.push(req.query.limit);
    console.log(SQLquery);
  }

  db.all(SQLquery, params, (err, rows) => {
    console.log(err);
    res.status(200).type("json").send(rows);
  });
});

let SQLcheck = "";
// PUT request handler for new crime incident
app.put("/new-incident", (req, res) => {
  console.log(req.body); // uploaded data
  SQLcheck = "SELECT case_number FROM Incidents WHERE case_number = ?"; //first we should check if this is null
  //then insert the new values
  
  SQLquery =
    "INSERT INTO (case_number,date_time, code, incident,police_grid, neighborhood_number,block) VALUES (";
    let between = "";
    params = [];
    count = 0;
    if(req.query.hasOwnProperty("case_number")) {
      SQLquery = SQLquery + "? ";
      params.push(req.params.case_number);
      count = count +1
    }
    if(req.query.hasOwnProperty("date_time")) {
        SQLquery = SQLquery + ",? ";
        params.push(req.params.date_time);
        count = count +1
      }
      if(req.query.hasOwnProperty("code")) {
        SQLquery = SQLquery + ",? ";
        params.push(req.params.code);
        count = count +1
      }
      if(req.query.hasOwnProperty("incident")) {
        SQLquery = SQLquery + ",? ";
        params.push(req.params.incident);
        count = count +1
      }
      if(req.query.hasOwnProperty("police_grid")) {
        SQLquery = SQLquery + ",? ";
        params.push(req.params.police_grid);
        count = count +1
      }
      if(req.query.hasOwnProperty("neighborhood_number")) {
        SQLquery = SQLquery + ",? ";
        params.push(req.params.neighborhood_number);
        count = count +1
      }
      if(req.query.hasOwnProperty("block")) {
        SQLquery = SQLquery + ",? ";
        params.push(req.params.block);
        count = count +1
      }
      if(count = 7){
        //all values are in there and can proceed
      }



  //once end the statement with a )
  SQLquery = SQLquery + ")";
  res.status(200).type("txt").send("OK"); // <-- you may need to change this
});

// DELETE request handler for new crime incident
app.delete("/remove-incident", (req, res) => {
  console.log(req.body); // uploaded data
  SQLcheck = "SELECT case_number FROM Incidents WHERE case_number = ?"; //first we should check if this is null

  //then delete if found
  SQLquery = "DELETE FROM Incidents WHERE case_number = ?";

  res.status(200).type("txt").send("OK"); // <-- you may need to change this
});

// Create Promise for SQLite3 database SELECT query
function databaseSelect(query, params) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Create Promise for SQLite3 database INSERT or DELETE query
function databaseRun(query, params) {
  return new Promise((resolve, reject) => {
    db.run(query, params, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Start server - listen for client connections
app.listen(port, () => {
  console.log("Now listening on port " + port);
});
