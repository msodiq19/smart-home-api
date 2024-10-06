const { connectCouchbase } = require('../../config/couchbase.config');
const { deviceSchema } = require('../models/device.model');
const { v4: uuidv4 } = require('uuid')

module.exports = {
  getAllDevices: async () => {
    try {
      const { cluster, buckets } = await connectCouchbase();
      const query = `SELECT deviceId, settings, status, type, userId FROM \`${buckets.devices._name}\``;
      const result = await cluster.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  getDevice: async (deviceId) => {
    try {
      const { buckets } = await connectCouchbase();
      const deviceData = await buckets.devices.defaultCollection().get(deviceId);
      return deviceData.content;
    } catch (error) {
      throw error;
    }
  },

  createDevice: async (deviceData) => {
    const deviceId = uuidv4();
    try {
      const { buckets } = await connectCouchbase();
      const device = {
        deviceId,
        ...deviceData,
        createdAt: new Date(),
      };
      const { error } = deviceSchema.validate(device);
      if (error) {
        const validationError = new Error(`Validation Error: ${error.details[0].message}`);
        validationError.statusCode = 400;
        throw validationError;
      }

      const result = await buckets.devices.defaultCollection().upsert(device.deviceId, device);
      return result.content;
    } catch (error) {
      throw error;
    }
  },

  updateDevice: async (deviceId, deviceData) => {
    try {
      const { buckets } = await connectCouchbase();
      const { error } = deviceSchema.validate(deviceData);
      if (error) {
        const validationError = new Error(`Validation Error: ${error.details[0].message}`);
        validationError.statusCode = 400;
        throw validationError;
      }

      // Perform the update
      await buckets.devices.defaultCollection().upsert(deviceId, deviceData);

      // Fetch the updated document
      const updatedDevice = await buckets.devices.defaultCollection().get(deviceId);
      return updatedDevice.content;
    } catch (error) {
      throw error;
    }
  },

  deleteDevice: async (deviceId) => {
    try {
      const { buckets } = await connectCouchbase();
      const result = await buckets.devices.defaultCollection().remove(deviceId);
      return result.content;
    } catch (error) {
      throw error;
    }
  },
};
