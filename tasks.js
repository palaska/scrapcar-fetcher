'use strict';

const request = require('request');

const userAgents = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.3',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.132 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:39.0) Gecko/20100101 Firefox/39.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/600.8.9 (KHTML, like Gecko) Version/8.0.8 Safari/600.8.9',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1944.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux i586; rv:31.0) Gecko/20100101 Firefox/31.0',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:24.0) Gecko/20100101 Firefox/24.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.137 Safari/4E423F',
  'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2224.3 Safari/537.36'
];

module.exports = {
  makeRequest: (task, ch, msg) => {
    request({
      url: task.url,
      timeout: 120000,
      headers: {
        'User-Agent': userAgents[Math.floor(Math.random()*userAgents.length)]
      }
    }, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        const obj = JSON.parse(body)[0];

        if (obj) {
          obj.items.shift();
          obj.items.forEach((it) => {
            const nTask = {
              url: `https://www.gumtree.com.au/j-cars-specs.json?make=${task.data.make}&model=${it.value}`,
              type: 'modelRequest',
              data: {
                make: task.data.make,
                model: it.value
              }
            };

            ch.sendToQueue('task_queue', new Buffer(JSON.stringify(nTask)), {
              deliveryMode: true
            });

            console.log('[x] Sent modelRequest, make: ' + task.data.make + ', model: ' + it.value);
          });
        }

        ch.ack(msg);
      } else { // request didnt return 200
        ch.sendToQueue(q, new Buffer(task), {
          deliveryMode: true
        });

        ch.nack(msg, false, false);
      }
    });
  },
  modelRequest: (task, ch, msg) => {
    request({
      url: task.url,
      timeout: 120000,
      headers: {
        'User-Agent': userAgents[Math.floor(Math.random()*userAgents.length)]
      }
    }, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        const obj = JSON.parse(body);

        if (obj && obj.years && obj.years.length) {
          obj.years.forEach((y) => {
            const nTask = {
              url: `https://www.gumtree.com.au/j-cars-specs.json?make=${task.data.make}&model=${task.data.model}&year=${y}`,
              type: 'yearRequest',
              data: {
                make: task.data.make,
                model: task.data.model,
                year: y
              }
            };

            ch.sendToQueue('task_queue', new Buffer(JSON.stringify(nTask)), {
              deliveryMode: true
            });

            console.log('[x] Sent yearRequest, make: ' + task.data.make + ', model: ' + task.data.model + ', year: ' + y);
          });
        } else {
          const nTask = {
            type: 'writeToDb',
            data: {
              make: task.data.make,
              model: task.data.model
            }
          };

          ch.sendToQueue('task_queue', new Buffer(JSON.stringify(nTask)), {
            deliveryMode: true
          });

          console.log('[x] Sent writeToDb, make: ' + task.data.make + ', model: ' + task.data.model);
        }

        ch.ack(msg);
      } else { // request didnt return 200
        ch.sendToQueue(q, new Buffer(task), {
          deliveryMode: true
        });

        ch.nack(msg, false, false);
      }
    });
  },
  yearRequest: (task, ch, msg) => {
    request({
      url: task.url,
      timeout: 120000,
      headers: {
        'User-Agent': userAgents[Math.floor(Math.random()*userAgents.length)]
      }
    }, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        const obj = JSON.parse(body);

        if (obj && obj.variants && obj.variants.length) {
          obj.variants.forEach((v) => {
            const nTask = {
              url: `https://www.gumtree.com.au/j-cars-specs.json?make=${task.data.make}&model=${task.data.model}&year=${task.data.year}&variant=${v}`,
              type: 'variantRequest',
              data: {
                make: task.data.make,
                model: task.data.model,
                year: task.data.year,
                variant: v
              }
            };

            ch.sendToQueue('task_queue', new Buffer(JSON.stringify(nTask)), {
              deliveryMode: true
            });

            console.log('[x] Sent variantRequest, make: ' + task.data.make + ', model: ' + task.data.model + ', year: ' + task.data.year + ', variant: ' + v);
          });
        } else {
          const nTask = {
            type: 'writeToDb',
            data: {
              make: task.data.make,
              model: task.data.model,
              year: task.data.year
            }
          };

          ch.sendToQueue('task_queue', new Buffer(JSON.stringify(nTask)), {
            deliveryMode: true
          });

          console.log('[x] Sent writeToDb, make: ' + task.data.make + ', model: ' + task.data.model + ', year: ' + task.data.year);
        }

        ch.ack(msg);
      } else { // request didnt return 200
        ch.sendToQueue(q, new Buffer(task), {
          deliveryMode: true
        });

        ch.nack(msg, false, false);
      }
    });
  },
  variantRequest: (task, ch, msg) => {
    request({
      url: task.url,
      timeout: 120000,
      headers: {
        'User-Agent': userAgents[Math.floor(Math.random()*userAgents.length)]
      }
    }, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        const obj = JSON.parse(body);

        if (obj && obj.vehicleFeatures && obj.vehicleFeatures.length) {
          obj.years.forEach((v) => {
            const nTask = {
              type: 'writeToDb',
              data: {
                make: task.data.make,
                model: task.data.model,
                year: task.data.year,
                variant: task.data.variant,
                features: v
              }
            };

            ch.sendToQueue('task_queue', new Buffer(JSON.stringify(nTask)), {
              deliveryMode: true
            });

            console.log('[x] Sent writeToDb, make: ' + task.data.make + ', model: ' + task.data.model + ', year: ' + task.data.year + ', variant: ' + task.data.variant + ', features: ' + v[v.length - 1].o2);
          });
        } else {
          const nTask = {
            type: 'writeToDb',
            data: {
              make: task.data.make,
              model: task.data.model,
              year: task.data.year,
              variant: task.data.variant
            }
          };

          ch.sendToQueue('task_queue', new Buffer(JSON.stringify(nTask)), {
            deliveryMode: true
          });

          console.log('[x] Sent writeToDb, make: ' + task.data.make + ', model: ' + task.data.model + ', year: ' + task.data.year + ', variant: ' + task.data.variant);
        }

        ch.ack(msg);
      } else { // request didnt return 200
        ch.sendToQueue(q, new Buffer(task), {
          deliveryMode: true
        });

        ch.nack(msg, false, false);
      }
    });
  },
  writeToDb: (task, ch, msg, collection) => {
    collection.insert(task.data);
    ch.ack(msg);
  },
};
