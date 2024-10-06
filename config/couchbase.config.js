const Couchbase = require('couchbase');
const config = require('./config.json');

let cluster = null;
let buckets = {};

async function connectCouchbase() {
  if (!cluster) {
    try {
      cluster = await Couchbase.connect(config.host, {
        username: config.username,
        password: config.password,
      });
      console.log('Connected to Couchbase Server');
    } catch (error) {
      console.error('Failed to connect to Couchbase:', error);
      throw error;
    }
  }

  // Initialize and cache the buckets
  if (!buckets.devices) {
    buckets.devices = cluster.bucket(config.buckets.devices);
  }

  if (!buckets.users) {
    buckets.users = cluster.bucket(config.buckets.users);
  }

  if (!buckets.schedules) {
    buckets.schedules = cluster.bucket(config.buckets.schedules);
  }

  return { cluster, buckets };
}

module.exports = {
  connectCouchbase,
};
