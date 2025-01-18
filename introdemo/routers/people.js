const peopleRouter = require('express').Router()
const People = require('../models/people')
const User = require('../models/users')
const jwt = require('jsonwebtoken')

// get token info from header using Bearer type
const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
        return authorization.replace('Bearer ', '')
    } return null
}

peopleRouter.get('/info', async (request, response) => {
    const people = await People.find({})

    response.send(
        `<p>
            Phonebook has info for ${people.length} people<br>
            ${new Date(Date.now()).toString()}
        <p>`
    )
})

peopleRouter.get('/people', async (request, response) => {
    const people = await People.find({})
    response.json(people)
})

peopleRouter.get('/people/:id', async (request, response, next) => {
    const person = await People.findById(request.params.id)
    try {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    } catch (error) {
        next(error)
    }
})

peopleRouter.delete('/people/:id', async (request, response, next) => {
    try {
        const person = await People.findByIdAndDelete(request.params.id)
        if (person) {
            response.status(204).end()
        }
    } catch (error) {
        next(error)
    }
})

peopleRouter.post('/people', async (request, response, next) => {
    const body = request.body

    // only allow logged in users to add a phonebook contact
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.TOKEN_SECRET)
    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' })
    }
    const user = await User.findById(decodedToken.id)

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'Name or number missing'
        })
    }

    const personExists = await People.findOne({ name: body.name })
    if (personExists) {
        return response.status(400).json({
            error: 'Name already exists'
        })
    }
    const person = new People({
        name: body.name,
        number: body.number,
        // user: user.id
    })


    try {
        const newPerson = await person.save()
        user.phonebook = user.phonebook.concat(newPerson._id)
        await user.save()
        response.status(201).json(newPerson)
    } catch (error) {
        next(error)
    }
})

peopleRouter.put('/people/:id', async (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    // use new: true to force event handler to use updated data instead of original
    try {
        const updatedPerson = await People.findByIdAndUpdate(request.params.id, person, { new: true })
        response.json(updatedPerson)
    }
    catch (error) {
        next(error)
    }
})

module.exports = peopleRouter