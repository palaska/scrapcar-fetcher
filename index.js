const db = require('./db');
const config = require('./config');
const worker = require('./worker');
const seeder = require('./seeder');

Promise.resolve()
.then(seeder.seed())
.then(db.initialize())
.then(obj => {
  for (let i = 0; i < config.workerCount; i++) {
    worker.run(obj.collection);
  }
}) // obj: { collection }
.catch(err => console.log(err));
