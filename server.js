console.log('Pizza Time !!!')
const express       = require('express');
const bodyParser    = require('body-parser');
const mongoose      = require('mongoose');
const MongoClient   = require('mongodb').MongoClient
const app           = express();
const dbConnection  = 'mongodb://localhost:27017/star-wars';

app.listen(3000, function () {
    console.log('listening on 3000')
    console.log(__dirname)
})

MongoClient.connect(dbConnection, { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to Database')
        const db = client.db('star-wars')
        const quotesCollection = db.collection('quotes')

        app.set('view engine', 'ejs')
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use(express.static('public'))
        app.use(bodyParser.json())

        // Middlewares and other routes here...
        app.get('/', function(req, res) {
            db.collection('quotes').find().toArray()
                .then(results => {
                    res.render('index.ejs', {quotes: results})
                })
                .catch(error => console.error(error))
        })
        app.post('/quotes', (req, res) => {
            quotesCollection.insertOne(req.body)
                .then(result => {
                    console.log(result)
                    res.redirect('/')
                })
                .catch(error => console.error(error))
        })
        app.put('/quotes', (req, res) => {
            quotesCollection.findOneAndUpdate(
                { name: 'Yoda' },
                {
                    $set: {
                        name: req.body.name,
                        quote: req.body.quote
                    }
                },
                {
                    upsert: true
                }
            )
                .then(result => {
                    res.json('Success')
                })
                .catch(error => console.error(error))
        })
        app.delete('/quotes', (req, res) => {
            quotesCollection.deleteOne(
                {name: req.body.name },
            )
            .then(result => {
                if (result.deletedCount === 0) {
                    return res.json('No quote to delete')
                }
                res.json(`Deleted Darth Vadar\'s quote`)
            })
            .catch(error => console.error(error))
        })
    })
    .catch(error => console.error(error))

