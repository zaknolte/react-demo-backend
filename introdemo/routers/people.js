const peopleRouter = require('express').Router()
const People = require('../models/people')


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
    })


    try {
        const newPerson = await person.save()
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