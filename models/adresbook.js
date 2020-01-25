const mongoose = require('mongoose')

const AddressSchema = mongoose.Schema({
    myemail:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true,
        unique: true
    },
    address:{
        type: String,
    },
    phone:{
        type: String,
        unique: true
    }
})

const Address = module.exports = mongoose.model('Address', AddressSchema);