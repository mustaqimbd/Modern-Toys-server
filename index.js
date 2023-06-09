const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors')
require('dotenv').config()
//middleware
app.use(cors())
app.use(express.json())


const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.znibnea.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        client.connect();
        const my_db = client.db('modern_toys').collection('toys')
        const carouselInfo = client.db('modern_toys').collection('carousel_images');
        
        app.get('/carousel-info', async (req, res) => {
            const result = await carouselInfo.find().toArray();
            res.send(result)
        })
        app.get('/', async (req, res) => {
            const result = await my_db.find().toArray()
            res.send(result)
        })
        app.post('/add-toy', async (req, res) => {
            const toy = req.body;
            const result = await my_db.insertOne(toy)
            res.send(result)
        })
        app.get('/all-toys', async (req, res) => {
            const result = await my_db.find().limit(20).toArray()
            res.send(result)
        })
        app.get('/all-toys/:text', async (req, res) => {
            const text = req.params.text;
            const regex = new RegExp(text, 'i');
            const result = await my_db.find({ name: { $regex: regex } }).toArray();
            res.send(result);
        });
        app.get('/:text', async (req, res) => {
            const text = req.params.text;
            const result = await my_db.find({ subCategory: text }).toArray()
            res.send(result)
        })
        app.get('/my-toys/:user', async (req, res) => {
            const query = req.params.user;

            const result = await my_db.find({ sellerEmail: query }).toArray();
            res.send(result)
        })
        app.get('/my-toys/ascending/:user', async (req, res) => {
            const query = req.params.user;

            const result = await my_db.find({ sellerEmail: query }).sort({ price: 1 }).toArray();
            res.send(result)
        })
        app.get('/my-toys/descending/:user', async (req, res) => {
            const query = req.params.user;

            const result = await my_db.find({ sellerEmail: query }).sort({ price: -1 }).toArray();
            res.send(result)
        })

        app.get('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const result = await my_db.findOne({ _id: new ObjectId(id) })
            res.send(result)
        })
        app.patch('/update/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    ...data
                },
            };
            const result = await my_db.updateOne(filter, updateDoc)

            res.send(result)
        })
        app.delete('/delete-toy/:id', async (req, res) => {
            const id = req.params.id;
            const result = await my_db.deleteOne({ _id: new ObjectId(id) })
            res.send(result)
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`The server is running on ${port} port`);
})