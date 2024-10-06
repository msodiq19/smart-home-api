const express = require('express');
const {getAllDevices, getDevice, createDevice, updateDevice, deleteDevice } = require('../controllers/device.controller');

const router = express.Router();

router.get('/', getAllDevices);
router.post('/', createDevice);
router.get('/:deviceId', getDevice);
router.patch('/:deviceId', updateDevice);
router.delete('/:deviceId', deleteDevice);

module.exports = router;