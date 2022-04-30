const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    registerDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Active', 'Pending'],
        default: 'Pending',
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
        required: true
    },
    confirmationCode: {
        type: String,
        unique: true,
        required: true
    }
})

const vendorModel = new mongoose.model('vendor', userSchema)

module.exports = vendorModel