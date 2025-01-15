const userRouter = require('express').Router()
const Users = require('../models/users')
const People = require('../models/people')

const bcrypt = require('bcrypt')

userRouter.get('/users', async (request, response) => {
    const users = await Users.find({}).populate('phonebook')
    response.json(users)
})

userRouter.post('/users', async (request, response, next) => {
    const body = request.body

    if (!body.username || !body.password) {
        return response.status(400).json({
            error: 'Username or password missing'
        })
    }

    const userExists = await Users.findOne({ name: body.username })
    if (userExists) {
        return response.status(400).json({
            error: 'Username already exists'
        })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new Users({
        name: body.name,
        username: body.username,
        password: passwordHash,
    })


    try {
        const newUser = await user.save()
        response.status(201).json(newUser)
    } catch (error) {
        next(error)
    }
})

module.exports = userRouter