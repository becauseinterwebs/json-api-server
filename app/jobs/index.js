'use strict';

const fs        = require('fs');
const path      = require('path');
const basename  = path.basename(module.filename);
const settings  = require('../config/settings');

let jobs = {};

// Load all jobs in this folder
fs
  .readdirSync(__dirname)
  .filter(file =>
    (file.indexOf('.') !== 0) &&
    (file !== basename) &&
    (file.slice(-3) === '.js'))
  .forEach(file => {
    // use the name of the model file as the key
    let name = file.slice(0, -3);
    jobs[name] = require(path.join(__dirname, file));
  });

//module.exports = jobs;

let args = process.argv;

if (args.length > 2) {
  let key = args[2];
  console.log('Run job', key);
  if (jobs.hasOwnProperty(key)) {
    let j = new jobs[key](settings.jobs[key]);
    j.run();
  } else {
    console.log('Job', key, 'not found');
  };
}
