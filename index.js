const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

//middleware
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zj6nics.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    await client.connect();
    
    const TaskData= client.db('TaskData').collection('Task');

    app.post('/Task', async(req,res)=>{
        const task= req.body;
        console.log(task);
        const result = await TaskData.insertOne(task);
        res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);


app.use(cors());
app.use(express.json());


app.get('/',(req,res)=>{
    res.send('Coffee making server is runing')
})

app.listen(port,()=>{
    console.log(`Task Manager Port :${port}`)
})