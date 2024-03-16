/**
 * Sunny Tian
 * 3/16/24
 */

// setup
"use strict";

const express = require('express');
const app = express();

const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");

const multer = require("multer");

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());
app.use(express.text());


// global module variables
const SERVER_ERROR = 500;
const SERVER_ERR_MSG = "Server error";
const PARAM_ERROR = 400;
const HOST_NUM = 8080;

app.get("/getScrobbles", async (req, res) => {
  let month = req.query.month;
  let year = req.query.year;

  try {
    let result = await getScrobblesByMonth(month, year);
    res.json(result);
  } catch (error) {
    res.status(SERVER_ERROR).type("text")
      .send(SERVER_ERR_MSG);
  }
});

async function getScrobblesByMonth(month, year) {
  let searchTerm = month + " " + year;
  try {
    let db = await getDbConnection();
    let query = "SELECT artist, album, song, date ";
    query += "FROM scrobbles ";
    query += "WHERE date LIKE '%";
    query += searchTerm;
    query += "%'";

    let scrobbles = await db.all(query);
    await db.close();
    return scrobbles;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function getDbConnection() {
  const db = await sqlite.open({
    filename: "lastfm.db",
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static("public"));
const PORT = process.env.PORT || HOST_NUM;
app.listen(PORT);