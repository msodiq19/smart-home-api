const { connectCouchbase } = require('../../config/couchbase.config');
const { userSchema } = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { get } = require('../routes/device.routes');

module.exports = {
  // Fetch all users
  getAllUsers: async () => {
    try {
      const { cluster, buckets } = await connectCouchbase();
      const query = `SELECT userId, email, roles, devices FROM \`${buckets.users._name}\``;
      const result = await cluster.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  // Fetch a user by ID
  getUserById: async (userId) => {
    try {
      const { buckets } = await connectCouchbase();
      const userData = await buckets.users.defaultCollection().get(userId);
      return userData.content;
    } catch (error) {
      if (error.code === 13) {
        const notFoundError = new Error(`User with ID ${userId} not found.`);
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      throw error;
    }
  },

  getUserByEmail: async (email) => {
    try {
      const { cluster, buckets } = await connectCouchbase();
      const query = `SELECT userId, email, passwordHash, roles, devices FROM \`${buckets.users._name}\` WHERE email = $1`;
      const options = {
        parameters: [email],
      };
      
      const result = await cluster.query(query, options);
      if (result.rows.length === 0) {
        return null;
      }
  
      return result.rows[0];
    } catch (error) {
        console.error('Error fetching user by email:', error);
      throw error;
    }
  },

  // Create a new user
  createUser: async (userData) => {
    const userId = uuidv4();
    try {
      const { cluster, buckets } = await connectCouchbase();

      const query = `SELECT email FROM \`${buckets.users._name}\` WHERE email = $1`;
      const options = {
        parameters: [userData.email],
      };
      const existingUserResult = await cluster.query(query, options);
      
      if (existingUserResult.rows.length > 0) {
        const userExistsError = new Error(`User with email ${userData.email} already exists.`);
        userExistsError.statusCode = 409; // Conflict status code
        throw userExistsError;
      }

      // Hash the user's password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      delete userData.password;
      
      const user = {
        userId,
        passwordHash: hashedPassword,
        ...userData,
        createdAt: new Date(),
      };
      // Validate user data with Joi
      const { error } = userSchema.validate(user);
      if (error) {
        const validationError = new Error(`Validation Error: ${error.details[0].message}`);
        validationError.statusCode = 400;
        throw validationError;
      }

      // Save the user data
      await buckets.users.defaultCollection().upsert(user.userId, user);
      return { message: 'User created successfully!' };
    } catch (error) {
      throw error;
    }
  },

  // Update an existing user
  updateUser: async (userId, userData) => {
    try {
      const { buckets } = await connectCouchbase();
      
      // Fetch the existing user data
      const existingUser = await buckets.users.defaultCollection().get(userId);
      if (!existingUser) {
        const notFoundError = new Error(`User with ID ${userId} not found.`);
        notFoundError.statusCode = 404;
        throw notFoundError;
      }

      // Validate updated data
      const { error } = userSchema.validate(userData);
      if (error) {
        const validationError = new Error(`Validation Error: ${error.details[0].message}`);
        validationError.statusCode = 400;
        throw validationError;
      }

      // Update the user data
      const updatedData = { ...existingUser.content, ...userData };
      await buckets.users.defaultCollection().upsert(userId, updatedData);

      return { message: 'User updated successfully!' };
    } catch (error) {
      throw error;
    }
  },

  // Delete a user by ID
  deleteUser: async (userId) => {
    try {
      const { buckets } = await connectCouchbase();
      
      // Remove the user document from Couchbase
      await buckets.users.defaultCollection().remove(userId);
      
      return { message: 'User deleted successfully!' };
    } catch (error) {
      if (error.code === 13) {
        const notFoundError = new Error(`User with ID ${userId} not found.`);
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      throw error;
    }
  }
};
