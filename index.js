const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken')
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middle wire
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bdo3vwq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const playerCollection = client.db("fifa-2023").collection("players");
    const productCollection = client.db("fifa-2023").collection("products");
    const userCollection = client.db("fifa-2023").collection("users");
    console.log("connection succefully");

    // get all the player info
    app.get("/player", async (req, res) => {
      const players = await playerCollection.find({}).toArray();
      res.send(players);
    });

    // get a specific player info
    app.get("/player/:id", async(req, res) =>{
      const id = req.params.id;
      // console.log(id)
      const filter = {_id: ObjectId(id)}
      const result = await playerCollection.findOne(filter);
      res.send(result)
    });

    // get all user data
    app.get('/user', verifyJWT, async(req,res) =>{
      const users = await userCollection.find({}).toArray();
      res.send(users)
    });

    // remove a user
    app.delete('/user/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)}
      const result = userCollection.deleteOne(query);
      res.send(result)
    });

    // make a user admin
    app.put('/user/admin/:email', async(req, res) =>{
      const email = req.params.email;
      const filter = {email: email}
      const updatedDoc = {
        $set:{
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc)
      res.send(result)
    })

    // put a user into the database
    app.put('/user/:email', async(req, res) =>{
      const email = req.params.email;
      const body = req.body;
      const filter = {email: email}
      const options = {upsert: true}
      const updatedDoc = {
        $set: body
      }
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
      const result = await userCollection.updateOne(filter, updatedDoc, options)
      res.send({result, token})
    });

    // get all the product info
    app.get("/product", async (req, res) => {
      const products = await productCollection.find({}).toArray();
      res.send(products);
    });

    // add a player (post method)
    app.post('/player', async(req, res) =>{
      const player = req.body;
      const result = await playerCollection.insertOne(player);
      res.send(result);
    });

     // Delete a specific player 
     app.delete('/player/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result =await playerCollection.deleteOne(query);
      res.send(result)
    });
  } finally {
  }
}
run().catch(console.dir);

// app listen koranor jonno server side eh
app.get("/", async (req, res) => {
  res.send("fifa server side is running");
});

// app listen korate hobe
app.listen(port, () => {
  console.log(`fifa server side is running on ${port}`);
});
