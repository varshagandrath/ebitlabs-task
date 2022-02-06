const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('db.sqlite3', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to ETH database.');
});
const app = express();


app.get('/api/fx/ohlc/:pair', (req, res) => {
  let pair = req.params.pair;

  //convert the pair from ETHUSD to ETH/USD
  pair = pair.replace('ETH', 'ETH/');

  //returns the most recent vwap price for the pair
  db.get(`SELECT vwap FROM market_price WHERE pair = ? ORDER BY startTime DESC LIMIT 1`, [pair], (err, row) => {
      if (err) {
          console.error(err.message);
          res.status(500).send({
              error: "Internal server error",
              code: 500
          });
      }
      res.status(200).json({
          pair: pair,
          vwap: row.vwap
      });
  });
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});