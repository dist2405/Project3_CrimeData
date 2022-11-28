// Built-in Node.js modules
let fs = require('fs');
let path = require('path');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');


let db_filename = path.join(__dirname, 'db', 'stpaul_crime.sqlite3');

let app = express();
let port = 8000;
let SQLquery = '';

app.use(express.json());
//to parse the string
function parseQueryString(q_string){
    let key_values = q_string.substring(1).split('&');
    console.log(key_values);
    let i;
    let query_obj = {};
    for(i=0;i< key_values.length;i++){
        let key_val = key_values[i].split('=');
        query_obj[key_val[0]]= key_val[1];
        console.log(key_val);

    }
    console.log(query_obj);
    return query_obj;
}

// Open SQLite3 database (in read-only mode)
let db = new sqlite3.Database(db_filename, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log('Error opening ' + path.basename(db_filename));
    }
    else {
        console.log('Now connected to ' + path.basename(db_filename));
    }
});


// GET request handler for crime codes
app.get('/codes', (req, res) => {
    SQLquery = 'SELECT code, incident_type AS type FROM codes ';
    console.log(req.query); // query object (key-value pairs after the ? in the url)
    //need if statement for certain codes
    let params = [];
    clause = 'WHERE';
    if(req.query.hasOwnProperty('code')){
        SQLquery = SQLquery +  clause + ' code = ? '
        params.push(req.query.code);
        clause = 'AND';
    };
    SQLquery = SQLquery + ' ORDER BY code ';

    res.status(200).type('json').send({}); // <-- you will need to change this
});

// GET request handler for neighborhoods
app.get('/neighborhoods', (req, res) => {
    SQLquery = 'SELECT neighborhood_number AS id, neighborhood_name as name FROM neighborhoods ';
    console.log(req.query); // query object (key-value pairs after the ? in the url)
    //need if statement for certain id's 
    SQLquery = SQLquery + ' ORDER BY neighborhood_number ';
    res.status(200).type('json').send({}); // <-- you will need to change this
});

// GET request handler for crime incidents
app.get('/incidents', (req, res) => {
    SQLquery = 'SELECT case_number, date(date_time) AS date,time(date_time) as time,code, incident, police_grid, neighborhood_number, block FROM Incidents';
    console.log(req.query); // query object (key-value pairs after the ? in the url)
    //need if statement for start/end dates/code/grid/ neighbothood
    SQLquery = SQLquery + 'ORDER BY date_time';
    //need if statement here for limit

    res.status(200).type('json').send({}); // <-- you will need to change this
});
let SQLcheck = '';
// PUT request handler for new crime incident
app.put('/new-incident', (req, res) => {
    console.log(req.body); // uploaded data
    SQLcheck = 'SELECT case_number FROM Incidents WHERE case_number = ?' ;//first we should check if this is null
    //then insert the new values
    SQLquery = 'INSERT INTO (case_number,date_time, code, incident,police_grid, neighborhood_number,block) VALUES (';
    
    //once end the statement with a )
    SQLquery = SQLquery + ')';
    res.status(200).type('txt').send('OK'); // <-- you may need to change this
});

// DELETE request handler for new crime incident
app.delete('/remove-incident', (req, res) => {
    console.log(req.body); // uploaded data
    SQLcheck = 'SELECT case_number FROM Incidents WHERE case_number = ?'; //first we should check if this is null

    //then delete if found
    SQLquery = 'DELETE FROM Incidents WHERE case_number = ?';
    
    res.status(200).type('txt').send('OK'); // <-- you may need to change this
});


// Create Promise for SQLite3 database SELECT query 
function databaseSelect(query, params) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        })
    })
}

// Create Promise for SQLite3 database INSERT or DELETE query
function databaseRun(query, params) {
    return new Promise((resolve, reject) => {
        db.run(query, params, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    })
}


// Start server - listen for client connections
app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
