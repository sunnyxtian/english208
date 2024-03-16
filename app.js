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
const PARAM_ERROR = 400;
const HOST_NUM = 8080;

app.get("/posts", function(req, res) {
  res.type("text").send("hello world");
});

app.use(express.static("public"));
const PORT = process.env.PORT || HOST_NUM;
app.listen(PORT);