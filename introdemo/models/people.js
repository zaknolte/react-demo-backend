const mongoose = require('mongoose')

const peopleSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: {
        type: String,
        minLength: 7,
        required: true
    },
})

peopleSchema.set('toJSON', {
    transform: (document, obj) => {
        obj.id = obj._id.toString()
        delete obj._id
        delete obj.__v
    }
})


module.exports = mongoose.model('People', peopleSchema)