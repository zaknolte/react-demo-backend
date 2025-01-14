const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: String,
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phonebook: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "People"
        }
    ]
})

userSchema.set('toJSON', {
    transform: (document, obj) => {
        obj.id = obj._id.toString()
        delete obj._id
        delete obj.__v
        // don't return password hash through request
        delete obj.password
    }
})


module.exports = mongoose.model('Users', userSchema)