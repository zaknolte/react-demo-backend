const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/users')

// base url/login
loginRouter.post('/login', async (request, response) => {
    const { username, password } = request.body

    const user = await User.findOne({ username })

    const isAuthenticated = user === null
        ? false
        : await bcrypt.compare(password, user.password)

    if (!(user && isAuthenticated)) {
        return response.status(401).json({
            error: 'invalid username or password'
        })
    }

    // write user data to a token
    const userToken = {
        username: user.username,
        id: user._id,
    }

    // token expires in 60*60 seconds, that is, in one hour
    const token = jwt.sign(
        userToken,
        process.env.TOKEN_SECRET,
        { expiresIn: 60 * 60 }
    )

    response
        .status(200)
        .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter