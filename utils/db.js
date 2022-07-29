// Connect to Mongoose
const mongoose = require('mongoose')

// Connect to MongoDB Local server
mongoose.connect('mongodb://127.0.0.1:27017/administration', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true    // otomatis nambahin index setiap data yg masuk/di-insert
})

// // Membuat Schema [Struktur Database: Contact App] [Class Contact]
// const Contact = mongoose.model('Contact', {
//     nama: {
//         type: String,
//         required: true
//     },
//     email: {
//         type: String
//     },
//     nohp: {
//         type: String,
//         required: true
//     }
// })

// Kalau ingin berinteraksi dengan schemanya, maka harus instantiasi
// const contact1 = new Contact()        // contoh

// Menambah 1 Data
// const contact1 = new Contact({
//     nama: "Rivano ATK",
//     email: "rivano.atk@gmail.com",
//     nohp: '0812523532653'
// })

// contact1.save().then((contact) => console.log(contact))
