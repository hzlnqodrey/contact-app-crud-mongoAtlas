const express = require('express')

const app = express()
const port = 5000

// Import DB Connection
require('./utils/db')
const Contact = require('./model/contact')


// set up middleware
// [Module View Engine] - Tell express that we use EJS
app.set('view engine', 'ejs')
const expressLayouts = require('express-ejs-layouts')

// Third-party Middleware
    // 1. EJS Layouts
    app.use(expressLayouts)

    // 2. Url Encoded (Parsing Body JSON)
    app.use(express.urlencoded({ extended: true }))

    // 3. Flash Message
    const session = require('express-session')
    const cookieParser = require('cookie-parser')
    const flash = require('connect-flash')
        // Konfigurasi Flash Message
            // 1. Cookie Parser, dengan key default = secret
            app.use(cookieParser('secret'))
            // 2. Session
            app.use(session({
                cookie: { maxAge: 6000 },
                secret: 'secret',
                resave: true,
                saveUninitialized: true
            }))
            // 3. Flash
            app.use(flash())

    // 4. Express Validator
    const { body, validationResult, check } = require('express-validator')

    // 5. Method-override
    const methodOverride = require('method-override')
    app.use(methodOverride('_method'))


// Halaman Home (INDEX)
app.get('/', (req, res) => {
    const Identitas = [
        {
            Nama: 'Hazlan Muhammad Qodri',
            Umur: 22,
            KTP: 12312491201293,
            Kota: 'Payakumbuh',
            Provinsi: 'Sumatera Barat'
        },
        {
            Nama: 'Gilang Martadinata',
            Umur: 23,
            KTP: 1232421491201293,
            Kota: 'Bandar Lampung',
            Provinsi: 'Lampung'
        },
    ]

    const date_now = new Date().toISOString()

    // Send data to index's page
    res.render('index', {
        // Views Setting
        layout: 'layouts/main-layout',

        // Data Sending
        ID_Document: '324124124123123',
        Published_Date: date_now,
        Identitas,
        title: 'Halaman Utama'
    })
})

// Halaman ABOUT
app.get('/about', (req, res) => {
    res.render('about', {
        // Views Setting
        layout: 'layouts/main-layout',

        // Data Sending
        title: 'Halaman About',
    })
})

// Halaman Kontak / GET ALL LIST CONTACTS
app.get('/contact', async (req, res) => {
    // [Step #1] - Get Data Contacts

    // kalau memakai metode Promise
    // Contact.find().then((contacts) => {
    //     res.send(contacts)
    // })

    // Kalau memakai metode async-await
    const contacts = await Contact.find()

    res.render('contact', {
        // Views Setting
        layout: 'layouts/main-layout',

        // Data Sending
        title: 'Halaman Contact',
        contacts,
        flashMessage: req.flash('flashMessage'),
    })
})

// GET FORM ADD CONTACT PAGE
app.get('/contact/add', (req, res) => {
    res.render('add-contact', {
        // View Setting
        layout: 'layouts/main-layout',
        title: 'Form Tambah Data Contact',
    })
})

// Add Contact data
app.post('/contact', 
    [
        body('nama')
            .custom( async (value) => {
                const duplikat = await Contact.findOne({
                    nama: value
                })

                if (duplikat) {
                    throw new Error('Nama kontak sudah digunakan')
                }

                return true
            }),
        check('email')
            .isEmail()
            .withMessage('Email tidak valid'),
        check('nohp')
            .isMobilePhone('id-ID')
            .withMessage('Nomor Handphone tidak valid')
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.render('add-contact', {
                // View Setting
                layout: 'layouts/main-layout',
                title: 'Form Tambah Data Contact',

                errors: errors.array()
            })
        } else {
            await Contact.create(req.body)
            req.flash('flashMessage', `Data contact ${req.body.nama} berhasil ditambahkan!`)
            res.redirect('/contact')
        }
})

// Edit Contact Page
app.get('/contact/edit/:nama', async (req, res) => {

    const contact = await Contact.findOne({
        nama: req.params.nama
    })

    res.render('edit-contact', {
        // View Setting
        layout: 'layouts/main-layout',
        title: 'Form Ubah Data Contact',

        // Data Sending
        contact
    })
})

// Edit Process
app.put('/contact', 
    // Validasi
    [
        // Validate Name (Check Duplicate Name) Logic in Edit Form
        body('nama')
            .custom( async (value, { req }) => {
                // check Nama Function
                const duplikat = await Contact.findOne({
                    nama: value
                })

                if (value !== req.body.oldNama && duplikat) {
                    throw new Error('Nama contact sudah digunakan!')
                }

                return true
            }),
        // Validate Email
        check('email')
            .isEmail()
            .withMessage('Email tidak valid!'),

        // Validate Mobile Phone
        check('nohp')
            .isMobilePhone('id-ID')
            .withMessage('Nomor Handphone tidak valid!'),
    ],

    async (req, res) => {

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            res.render('edit-contact', {
                // View Setting
                layout: 'layouts/main-layout',
                title: 'Form Ubah Data Contact',

                // Data Sending
                errors: errors.array(),
                contact: req.body
            })
        } else {
           await Contact.updateOne(
                // Query or Filtering
                {
                    _id: req.body._id
                },
                // Setting new value
                {
                    $set: req.body
                }
            )
            req.flash('flashMessage', `Data contact ${req.body.oldNama} berhasil diubah!`)
            res.redirect('/contact')
        }

})

// app.get('/contact/delete/:nama', async (req, res) => {
//     const contact = await Contact.findOne({nama: req.params.nama})
//     if (!contact) {
//         res.status(404)
//         res.send('<h1>404</h1>')
//     } else {
        // await Contact.deleteOne({
        //     _id: contact._id 
        // }).then((result) => {
        //     req.flash('flashMessage', `Data contact ${req.params.nama} berhasil dihapus!`)
        //     res.redirect('/contact')
        //     console.log(result)
        // }).catch((error) => console.log(error))

//     }
// })

app.delete('/contact', (req, res) => {
    Contact.deleteOne({
        nama: req.body.nama
    }).then((result) => {
        req.flash('flashMessage', `Data contact ${req.params.nama} berhasil dihapus!`)
        res.redirect('/contact')
        console.log(result)
    }).catch((error) => console.log(error))
})


// GET DETAILED CONTACT
app.get('/contact/:nama', async (req, res) => {
    // [Step #1] - Get Data Contacts
    const contact = await Contact.findOne({
        nama: req.params.nama
    })

    res.render('detail', {
        // Views Setting
        layout: 'layouts/main-layout',

        // Data Sending
        title: 'Halaman Detail Contact',
        contact,
    })
})


app.listen(port, () => {
    console.log(`Mongo Contact App | listening at http://localhost:${port}`);
})
