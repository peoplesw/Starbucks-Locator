const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios')
const { db } = require('./api/models/store');
const app = express();
const Store = require('./api/models/store');
const GoogleMapsService = require('./api/services/googleMapsService');
const googleMaps = new GoogleMapsService();
require('dotenv').config();

// connects me to my mongodb database on Atlas
mongoose.connect(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});
// lets you access "req.body" json data (and allows you to optionally set limit of json payload size)
app.use(express.json({limit: '50mb'}));
// lets people access (fetch) json data at api endpoints
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// Start API Endpoints
app.get('/api/stores', (req, res) => {
  const zipCode = req.query.zip_code;
  
  googleMaps.getCoordinates(zipCode)
  .then(coordinates => {
    Store.find({
      location: {
        $near: {
          $maxDistance: 8047, // radius from center of zip code in meters (8047 meters = 5 miles)
          $geometry: {
              type: "Point",
              coordinates: coordinates
          }
        }
      }
    },(err, stores) => {
          if(err) {
            res.status(500).send(err);
          }else {
            res.status(200).send(stores);
          }
    });
  }).catch(error => {
    console.log(error)
  });
});

app.post('/api/stores', (req, res) => {
  let dbStores = [];
  let stores = req.body;
  stores.forEach(store => {
      dbStores.push({
        storeName: store.name,
        phoneNumber: store.phoneNumber,
        address: store.address,
        openStatusText: store.openStatusText,
        addressLines: store.addressLines,
        location: {
          type: 'Point',
          coordinates: [store.coordinates.longitude, store.coordinates.latitude]
        }
      });
  });
  
  Store.create(dbStores, (err, stores) => {
    if(err) {
      res.status(500).send(err);
    }else {
      res.status(200).send(stores);
    }
  });
});

app.delete('/api/stores', (req, res) => {
  Store.deleteMany({}, err => res.send(err));
});





app.listen(3000, () => console.log('Now listening on port 3000!'))