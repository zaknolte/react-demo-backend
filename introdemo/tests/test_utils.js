const People = require('../models/people')
const Users = require('../models/users')

const testPeople = [
    {
        name: 'james smithington',
        number: 6549871
    },
    {
        name: 'blu blu blu',
        number: 4567893
    }
]

const deletedId = async () => {
    const person = new People({ name: 'doesnt exist', number: 1111111 })
    await person.save()
    await person.deleteOne()

    return person._id.toString()
}

const allPeople = async () => {
    const people = await People.find({})
    return people.map(person => person.toJSON())
}

const usersInDb = async () => {
    const users = await Users.find({})
    return users.map(user => user.toJSON())
}

module.exports = {
    testPeople, deletedId, allPeople, usersInDb
}