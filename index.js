const express = require("express");
const cors = require("cors");
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

async function run() {
  try {
    await client.connect();
    const playerCollection = client.db("fifa-2023").collection("players");
    console.log("connection succefully");

    // get all the player info
    app.get("/player", async (req, res) => {
      const players = await playerCollection.find({}).toArray();
      res.send(players);
    });

    // get a specific player info
    app.get('/player/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)}
      const result = playerCollection.findOne(query);
      res.send(result)
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
