const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    vendorName: {
        type: String,
        required: true
    },
    vendorType: {
        type: String,
        enum: ['type1', 'type2'],
        default: 'type1',
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
    registerDocs: {
        type: [String],
        default: [],
        required: true
    },
    companyAddress: {
        type: String,
        required: true,
        default: ''
    },
    coords: {
        type: {
            latitude: Number,
            longitude: Number,
            _id: false
        },
        reduired: true
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