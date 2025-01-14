const { test, after, beforeEach, describe } = require('node:test')
const Users = require('../models/users')
const assert = require('node:assert/strict')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const testUtils = require('./test_utils')

const api = supertest(app)

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await Users.deleteMany({})

        const passwordHash = await bcrypt.hash('testpassword', 10)
        const user = new Users({ username: 'testuser', password: passwordHash })

        await user.save()
    })

    test('creation succeeds with a new username', async () => {
        const usersAtStart = await testUtils.usersInDb()

        const newUser = {
            username: 'someotheruser',
            name: 'John jonnyson',
            password: 'johnspassword',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await testUtils.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        assert(usernames.includes(newUser.username))
    })

    test('creation fails with an existing username', async () => {
        const usersAtStart = await testUtils.usersInDb()

        const newUser = {
            username: 'testuser',
            name: 'not john',
            password: 'somepassword',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        const usersAtEnd = await testUtils.usersInDb()

        assert(result.body.error.includes('expected `username` to be unique'))
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
})

after(async () => {
    await mongoose.connection.close()
})