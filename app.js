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

app.get('/api/fx/ohlc/:pair/history', (req, res) => {
    let pair = req.params.pair;

    //convert the pair from ETHUSD to ETH/USD
    pair = pair.replace('ETH', 'ETH/');

    //retrieve the historical high/low prices for each day in descending date order
    db.all(`SELECT date(datetime(startTime, 'unixepoch')) as day, 
    MAX(high) as high, MIN(low) as low 
    FROM market_price WHERE pair = ? GROUP BY day ORDER BY day ASC`, [pair], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send({
                error: "Internal server error",
                code: 500
            });
        }

        //convert result from [
        // {
        //     "day": "2021-06-15",
        //     "high": 2615.22,
        //     "low": 2508.89
        // },
        // {
        //     "day": "2021-06-18",
        //     "high": 2339.91,
        //     "low": 2135
        // }]
        // to
        // [
        //   ["ETH/USD", "2021-06-15", 1854.99, 1785.58],
        //   ["ETH/USD", "2021-06-18", 1954.99, 1745.58],
        // ]
        let result = rows.map(row => [pair, row.day, row.high, row.low]);
        res.status(200).json(result);
    });
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});