const deviceService = require('../services/device.service');
const redisClient = require('../../config/redis.config');

const getAllDevices = async (req, res, next) => {
  try {
    const cacheKey = 'all_devices';
    const cachedDevices = await redisClient.get(cacheKey);

    if (cachedDevices) {
      return res.status(200).json({
        status: 'success',
        message: 'Devices fetched successfully',
        data: JSON.parse(cachedDevices),
      });
    }
    
    const devices = await deviceService.getAllDevices();
    await redisClient.set(cacheKey, JSON.stringify(devices), { EX: 3600 });
    res.status(200).json({
      status: 'success',
      message: 'Devices fetched successfully',
      data: devices,
    });
  } catch (error) {
    next(error);
  }
};

const createDevice = async (req, res, next) => {
  try {
    const deviceData = req.body;
    const createdDevice = await deviceService.createDevice(deviceData);
    await redisClient.del('all_devices');
    res.status(201).json({
      status: 'success',
      message: 'Device created successfully',
      data: createdDevice,
    });
  } catch (error) {
    next(error);
  }
};

const getDevice = async (req, res, next) => {
  try {
    const { deviceId } = req.params;

    const cacheKey = `device_${deviceId}`;
    const cachedDevice = await redisClient.get(cacheKey);
    if (cachedDevice) {
      return res.status(200).json({
        status: 'success',
        message: 'Device fetched successfully',
        data: JSON.parse(cachedDevice),
      });
    }

    const device = await deviceService.getDevice(deviceId);
    if (!device) {
      return res.status(404).json({
        status: 'fail',
        message: `Device not found`,
      });
    }
    await redisClient.set(cacheKey, JSON.stringify(device), { EX: 3600 });
    res.status(200).json({
      status: 'success',
      message: 'Device fetched successfully',
      data: device,
    });
  } catch (error) {
    next(error);
  }
};


const updateDevice = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const deviceData = req.body;
    const updatedDevice = await deviceService.updateDevice(deviceId, deviceData);
    
    if (!updatedDevice) {
      return res.status(404).json({
        status: 'failure',
        message: `Device not found`,
      });
    }
    await redisClient.del(`device_${deviceId}`);
    await redisClient.del('all_devices');
    res.status(200).json({
      status: 'success',
      message: 'Device updated successfully',
      data: updatedDevice,
    });
  } catch (error) {
    next(error);
  }
};

const deleteDevice = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const deletedDevice = await deviceService.deleteDevice(deviceId);
    
    if (!deletedDevice) {
      return res.status(404).json({
        status: 'fail',
        message: `Device not found`,
      });
    }
    await redisClient.del(`device_${deviceId}`);
    await redisClient.del('all_devices');
    res.status(200).json({
      status: 'success',
      message: `Device with ID ${deviceId} deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getAllDevices,
  createDevice,
  getDevice,
  updateDevice,
  deleteDevice,
};