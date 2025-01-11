const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const peopleRouter = require('./routers/people')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
    .then(() => {
        logger.info('connected to MongoDB')
    })
    .catch((error) => {
        logger.error('error connecting to MongoDB:', error.message)
    })


// add middleware in specific order
app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api', peopleRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app