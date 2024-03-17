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

const clientId = "0cd9f63ddd624c138c97ccb8a3f69f16";
const clientSecret = "4ed9dec813da4ed28e6cb447031cdc1b";

app.get("/analyzeScrobbles", async (req, res) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep",
   "Oct", "Nov", "Dec"];
  const years = ["2020", "2021", "2022", "2023", "2024"];

  try {
    for (let i = 0; i < years.length; i++) {
      let year = years[i];
      for (let j = 0; j < months.length; j++) {
        let month = months[j];

        let result = await getScrobblesByMonth(month, year); // gets this month's scrobbles
        console.log(month + " " +  year);

        if (result.length > 0) {
          // pass result into a counting method
          // make a new table for the top 20 songs
          // give each table to the spotify api
            // add valence and tempo to each table.
          let parsed = result.json();
          await insertIntoDatabase(parsed);
        }
      }
    }

  } catch (err) {
    console.log(err);
    res.status(SERVER_ERROR).type("text")
      .send(SERVER_ERR_MSG);
  }
});

app.get("/getScrobbles", async (req, res) => {
  let month = req.query.month;
  let year = req.query.year;

  try {
    let response = await getScrobblesByMonth(month, year);
    res.json(response);
  } catch (err) {
    throw err;
  }
});

async function getAccessToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: "POST",
    headers: {
      Authorization: `Basic ${encodeBase64(clientId + ':' + clientSecret)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

async function searchSong(accessToken, songName, artistName) {
  const searchURL = `https://api.spotify.com/v1/search?q=track:${songName} artist:${artistName}&type=track`;

  let response = await fetch(searchURL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  return data.tracks.items[0];
}

// Function to get track features
async function getTrackFeatures(accessToken, trackId) {
  const url = `https://api.spotify.com/v1/audio-features/${trackId}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  return data;
}

(async () => {
  const accessToken = await getAccessToken();
  // console.log(accessToken);

  // search through each song

  const trackData = await searchSong(accessToken, "The hours", "Beach House");

  if (trackData) {
    const trackId = trackData.id;
    const features = await getTrackFeatures(accessToken, trackId);
    console.log(`Valence of "${trackData.name}" by "${trackData.artists[0].name}": ${features.valence}`);
  } else {
    console.log('Song not found.');
  }
})();

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

function encodeBase64(str) {
  return btoa(`${clientId}:${clientSecret}`);
}

app.use(express.static("public"));
const PORT = process.env.PORT || HOST_NUM;
app.listen(PORT);