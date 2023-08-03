const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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

    //adding Task through post method
    app.post('/Task', async(req,res)=>{
        const task= req.body;
        console.log(task);
        const result = await TaskData.insertOne(task);
        res.send(result);
    })

    //showing added task by email

    app.get('/Task', async(req, res)=>{
      let data= {};

      if(req.query?.email){
        data= {email: req.query.email}
      }
      const result = await TaskData.find(data).toArray();

      res.send(result);
    })

    //delete by id

    app.delete('Task/:id', async(req, res)=>{
      const Task_id= req.params.id;
      const query={_id: new ObjectId(Task_id)}

      const result= await TaskData.deleteOne(query);
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