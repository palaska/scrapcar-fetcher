'use strict';

const fs = require('fs');
const amqp = require('amqplib');
const when = require('when');

const makes = JSON.parse(fs.readFileSync('./makes.json', 'utf-8'));

const seed = function() {
  return () => amqp.connect('amqp://localhost')
    .then((conn) => when(conn.createChannel()
      .then((ch) => {
        var q = 'task_queue';
        var ok = ch.assertQueue(q, {
          durable: true
        });

        return ok.then(function() {
          var task;

          makes.forEach((m) => {
            task = {
              url: `https://www.gumtree.com.au/p-select-attribute.json?categoryId=18320&attributeId=cars.carmake_s&rootAttribute=cars.carmake_s&optionPath=${m.id}`,
              type: 'makeRequest',
              data: {
                make: m.marka
              }
            };

            ch.sendToQueue(q, new Buffer(JSON.stringify(task)), {
              deliveryMode: true
            });

            console.log('[x] Sent %s', m.marka);
          });

          return ch.close();
        });
      })).ensure(function() {
        conn.close();
      })).then(null, console.warn);
}

module.exports = {
  seed
}
