const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
    const { username, password } = request.body

    const user = await User.findOne({ username })
    const isAuthenticated = user === null
        ? false
        : await bcrypt.compare(password, user.passwordHash)

    if (!(user && isAuthenticated)) {
        return response.status(401).json({
            error: 'invalid username or password'
        })
    }

    const userToken = {
        username: user.username,
        id: user._id,
    }

    const token = jwt.sign(userToken, process.env.TOKEN_SECRET)

    response
        .status(200)
        .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter