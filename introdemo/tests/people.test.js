const { test, after, beforeEach } = require('node:test')
const People = require('../models/people')
const assert = require('node:assert/strict')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const testUtils = require('./test_utils')

const api = supertest(app)


beforeEach(async () => {
    await People.deleteMany({})
    for (let person of testUtils.testPeople) {
        let newPerson = new People(person)
        await newPerson.save()
    }
})

test('people are returned as json', async () => {
    await api
        .get('/api/people')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('the correct number of people are returned', async () => {
    const dbPeople = await api.get('/api/people')

    assert.strictEqual(dbPeople.length, testUtils.allPeople().length)
})

test('a new person can be added ', async () => {
    const person = {
        name: 'james smith test',
        number: 6516547,
    }

    await api
        .post('/api/people')
        .send(person)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const people = await testUtils.allPeople()
    assert.strictEqual(people.length, testUtils.testPeople.length + 1)
    const names = people.map(n => n.name)

    assert(names.includes('james smith test'))
})

test('person without name is not added', async () => {
    const person = {
        number: 6549871
    }

    await api
        .post('/api/people')
        .send(person)
        .expect(400)

    const people = await testUtils.allPeople()
    assert.strictEqual(people.length, testUtils.testPeople.length)
})

test('a specific note can be viewed', async () => {
    const people = await testUtils.allPeople()

    const testPerson = people[0]

    const person = await api
        .get(`/api/people/${testPerson.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    assert.deepStrictEqual(person.body, testPerson)
})

test('a note can be deleted', async () => {
    const people = await testUtils.allPeople()
    const deletedPerson = people[0]

    await api
        .delete(`/api/people/${deletedPerson.id}`)
        .expect(204)
    const finalPeople = await testUtils.allPeople()

    const names = finalPeople.map(r => r.name)
    assert(!names.includes(deletedPerson.name))

    assert.strictEqual(finalPeople.length, testUtils.testPeople.length - 1)
})

after(async () => {
    await mongoose.connection.close()
})