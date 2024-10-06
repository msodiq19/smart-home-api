const express = require('express')
const { getAllUsers, getUser, loginUser, createUser, updateUser, deleteUser } = require('../controllers/user.controller')
const { authHandler, authorizeAdmin } = require('../middlewares/auth')

const router = express.Router()

// public routes
router.post('/login', loginUser)
router.post('/register', createUser)

router.use(authHandler)

// protected routes
router.get('/', authorizeAdmin, getAllUsers)
router.get('/:userId', getUser)
router.patch('/:userId', updateUser)
router.delete('/:userId', authorizeAdmin, deleteUser)




module.exports = router;