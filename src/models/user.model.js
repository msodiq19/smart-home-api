const Joi = require('joi');

const userSchema = Joi.object({
  userId: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required(),
  
  email: Joi.string()
    .email()  
    .required(),
  
  passwordHash: Joi.string()
    .min(60) 
    .required(),
  
  devices: Joi.array()
    .items(Joi.string()) 
    .default([]),
  
  role: Joi.string()
    .valid('admin', 'user')
    .default('user'),
  createdAt: Joi.date().default(() => new Date()).label('Created At')
});

module.exports = {
  userSchema
};
