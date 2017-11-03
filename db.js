'use strict';

const mongodb = require('mongodb');
const config = require('./config');
const Bluebird = require('bluebird');
const MongoClient = mongodb.MongoClient;

const connectAsync = Bluebird.promisify(MongoClient.connect);

function initialize() {
  return () => connectAsync('mongodb://localhost/scrapcar')
    .then((db) => {
      const collection = db.collection(config.dbCollectionName);
      return {
        collection
      };
    })
    .catch(err => console.log(err));
}

module.exports = {
  initialize
};

