const mongoose = require('mongoose')

// Membuat Model/Schema [Struktur Database: Contact App] [Class Contact]
const Contact = mongoose.model('Contact', {
    nama: {
        type: String,
        // required: true
    },
    email: {
        type: String
    },
    nohp: {
        type: String,
        // required: true
    }
})

module.exports = Contact
