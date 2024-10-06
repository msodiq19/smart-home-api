const userService = require('../services/user.service');
const redisClient = require('../../config/redis.config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const getAllUsers = async (req, res, next) => {
    try {
        const cacheKey = 'all_users';
        const cachedUsers = await redisClient.get(cacheKey);

        if (cachedUsers) {
            return res.status(200).json({
                status: 'success',
                message: 'Users fetched successfully',
                data: JSON.parse(cachedUsers),
            });
        }

        const users = await userService.getAllUsers();
        await redisClient.set(cacheKey, JSON.stringify(users), { EX: 3600 });
        res.status(200).json({
            status: 'success',
            message: 'Users fetched successfully',
            data: users,
        });

    } catch (error) {
        next(error);
    }
}

const getUser = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const cacheKey = `user_${userId}`;
        const cachedUser = await redisClient.get(cacheKey);

        if (cachedUser) {
            return res.status(200).json({
                status: 'success',
                message: 'User fetched successfully',
                data: JSON.parse(cachedUser),
            });
        }

        const user = await userService.getUserById(userId);
        await redisClient.set(cacheKey, JSON.stringify(user), { EX: 3600 });
        res.status(200).json({
            status: 'success',
            message: 'User fetched successfully',
            data: user,
        });

    } catch (error) {
        next(error);  
    }
}

const loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    try {
      // Get user by email
      const user = await userService.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Compare the password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.userId, roles: user.roles },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.status(200).json({
        message: 'Login successful',
        token,
      });
    } catch (error) {
        console.error('Login error:', error);
      next(error);
    }
}

const createUser = async (req, res, next) => {
    try {
        const response = await userService.createUser(req.body);
        await redisClient.del('all_users');
        res.status(201).json({
            status: 'success',
            message: response.message,
        });
    } catch (error) {
        next(error);
    }
}

const updateUser = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const response = await userService.updateUser(userId, req.body);
        await redisClient.del(`user_${userId}`);
        await redisClient.del('all_users');
        res.status(200).json({
            status: 'success',
            message: response.message,
        });
    } catch (error) {
        next(error);
    }
}

const deleteUser = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const response = await userService.deleteUser(userId);
        await redisClient.del(`user_${userId}`);
        await redisClient.del('all_users');
        res.status(200).json({
            status: 'success',
            message: response.message,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { getAllUsers, getUser, loginUser, createUser, updateUser, deleteUser };