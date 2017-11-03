'use strict';

const request = require('request');
const amqp = require('amqplib');
const when = require('when');
const chalk = require('chalk');
const tasks = require('./tasks');

function run(collection) {
  amqp.connect('amqp://localhost').then(function(conn) {
    process.once('SIGINT', function() {
      conn.close();
    });

    return conn.createChannel().then(function(ch) {
      var q = 'task_queue';

      const doWork = (msg) => {
        if (!msg.content.toString().trim()) {
          ch.ack(msg);
          return;
        }

        const task = JSON.parse(msg.content.toString());
        console.log(chalk.white('✈ New task ✈'));
        console.log(chalk.blue('URL: ') + chalk.cyan(task.type));

        tasks[task.type](task, ch, msg, collection);
      }

      var ok = ch.assertQueue(q, {
        durable: true
      });

      ok = ok.then(function() {
        ch.prefetch(1);
      });

      ok = ok.then(function() {
        ch.consume(q, doWork, {
          noAck: false
        });
        console.log(chalk.yellow('[*] Waiting for messages. To exit press CTRL+C'));
      });

      return ok;
    }).then(null, console.warn);
  });
}

module.exports = {
  run
};
