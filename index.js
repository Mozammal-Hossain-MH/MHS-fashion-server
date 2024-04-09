require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


// middlewares
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4zcowrs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const itemsCollection = client.db('MHSfashion').collection('items');
const ratingsCollection = client.db('MHSfashion').collection('ratings');

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();




        // items collection
        app.get('/items-count', async (req, res) => {
            const panjabi = await itemsCollection.countDocuments({ category: 'panjabi' });
            const polo = await itemsCollection.countDocuments({ category: 'polo' });
            const shirt = await itemsCollection.countDocuments({ category: 'shirt' });
            res.send({ panjabi, polo, shirt })
        })

        app.get('/category/:gender', async (req, res) => {
            const gender = req.params.gender;
            const result = await itemsCollection.aggregate([
                {
                    $match: { gender: gender }
                },
                {
                    $sample: { size: 22 }
                }
            ]).toArray();
            res.send(result);
        })

        app.get('/category/men/:itemName', async (req, res) => {
            const item = req.params.itemName;
            const query = { category: item };
            const result = await itemsCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await itemsCollection.findOne(query);
            res.send(result);
        })

        app.get('/items/:speciality', async (req, res) => {
            const speciality = req.params.speciality;
            const result = await itemsCollection.aggregate([
                {
                    $match: { speciality: speciality }
                },
                {
                    $sample: { size: 600 }
                }
            ]).toArray();
            res.send(result);
        })


        // ratings collection
        app.get('/ratings', async (req, res) => {
            const result = await ratingsCollection.find().toArray();
            res.send(result);
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


app.get('/', (req, res) => {
    res.send({ message: 'MHS Fashion server is running' })
})

app.listen(port, () => {
    console.log(`server is running on port: ${port}`)
})