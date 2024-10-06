const Joi = require('joi');

const deviceSchema = Joi.object({
  deviceId: Joi.string().required().label('Device ID'),
  status: Joi.string().valid('on', 'off').required().label('Status'),
  type: Joi.string().valid('light', 'camera', 'thermostat').required().label('Type'),
  settings: Joi.object({
    brightness: Joi.number().min(0).max(100).optional(),
    color: Joi.string().optional(),
    recording: Joi.boolean().optional(),
    feedUrl: Joi.string().uri().optional(),
    temperature: Joi.number().min(0).max(100).optional(),
    mode: Joi.string().valid('heating', 'cooling', 'auto').optional()
  }).required(),
  userId: Joi.string().required().label('User ID'),
  createdAt: Joi.date().default(() => new Date()).label('Created At')
});

module.exports = { deviceSchema };
