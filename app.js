"use strict";

const express = require('express');
const app = express();

app.get("/posts", function(req, res) {
  res.type("text").send("hello world");
});
app.listen(8080);