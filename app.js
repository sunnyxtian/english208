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

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep",
   "Oct", "Nov", "Dec"];
const years = ["2020", "2021", "2022", "2023", "2024"];

const clientId = "0cd9f63ddd624c138c97ccb8a3f69f16";
const clientSecret = "4ed9dec813da4ed28e6cb447031cdc1b";

app.get("/details2022", async (req, res) => {
  try {
    await addDetails2022();
    console.log("done");
  } catch (err) {
    console.log(err);
    res.type(SERVER_ERROR).type("text")
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

/** Returns the top 10 songs from a given month, to be displayed on the webpage. */
app.get("/getTopSongs", async(req, res) => {
  let month = req.query.month;

  try {
    let result = await getTopSongsByMonth(month);
    res.json(result);
  } catch (err) {
    console.log(err);
    res.type(SERVER_ERROR).type("text")
      .send(SERVER_ERR_MSG);
  }
});

async function getTopSongsByMonth(month) {
  let num = parseInt(month);
  try {
    let db = await getDbConnection();
    let query = `
      SELECT artist, song, plays, valence, tempo, danceability, energy
      FROM topScrobbles2022
      WHERE month = ?
    `
    let result = await db.all(query, num);
    await db.close();
    return result;
  } catch (err) {
    throw err;
  }
}

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

// fetches the track features from the given id from spotify.
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

// returns an object with the given song's valence, tempo, danceability, energy
async function getSongFeatures (artist, song) {
  const accessToken = await getAccessToken();

  let songData = await searchSong(accessToken, song, artist);

  if (songData) {
    let songId = songData.id;

    let response = await getTrackFeatures(accessToken, songId);

    let features = {
      valence : response.valence,
      tempo : response.tempo,
      dance : response.danceability,
      energy : response.energy
    }

    return features;

  } else {
    return;
  }
}

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

async function addDetails2022() {
  try {
    let db = await getDbConnection();
    let query = `
      SELECT artist, song
      FROM topScrobbles2022
    `;

    let topSongs = await db.all(query);

    for (let i = 0; i < topSongs.length; i++) {
      let artist = topSongs[i].artist;
      let song = topSongs[i].song;
      await addSongDetails(artist, song);
    }
    await db.close();
    console.log("done");
  } catch (err) {
    throw err;
  }
}

async function addSongDetails(artist, song) {
  try {
    let details = await getSongFeatures(artist, song);
    if (details) {
      let db = await getDbConnection();
      let query = `
        UPDATE topScrobbles2022
        SET valence = ?, tempo = ?, danceability = ?, energy = ?
        WHERE artist = ? AND song = ?
      `;
      await db.run(query, details.valence, details.tempo, details.dance, details.energy, artist, song);
      await db.close();
    } else {
      return;
    }
  } catch (err) {
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