require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();
const cors = require('cors');


const corsOptions ={
  origin:'*', 
  credentials:true,
  optionSuccessStatus:200,
}
app.use(cors(corsOptions))

app.use(express.json());
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

    // await client.connect();
    
    const TaskData= client.db('TaskData').collection('Task');
    const userData = client.db("TaskData").collection("users");

    //sociallogin
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await userData.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists' })
      }
      const result = await userData.insertOne(user);
      res.send(result);
    })
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

    //showing added task by id
    app.get('/Task/:id', async(req,res)=>{
      const id= req.params.id;
      const query={_id: new ObjectId(id)}
      const result = await TaskData.findOne(query);
      res.send(result);
    })
    //delete by id
    app.delete('/Task/:id', async(req, res)=>{
      const id= req.params.id;
      const query={_id: new ObjectId(id)}

      const result= await TaskData.deleteOne(query);
      res.send(result);
    })

    //update status
    app.patch('/Task/:id', async(req, res)=>{
      const id= req.params.id;
      const filter ={_id: new ObjectId(id)};
      const TaskUpdateing = req.body;

      const updateDoc={
        $set:{
          status: TaskUpdateing.status
        },
      };

      const result= await TaskData.updateOne(filter, updateDoc);
      res.send(result);
    })

    // update task

    app.put('/update/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedTask=req.body;
      const task= {
        $set: {
          TaskName: updatedTask.TaskName,
          email: updatedTask.email,
          Date: updatedTask.Date,
          Time: updatedTask.Time,
          Description: updatedTask.Description,
        }
      }
      const result =await TaskData.updateOne(filter,task);
      res.send(result);
    })

    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('Task Manager server is runing')
})

app.listen(port,()=>{
    console.log(`Task Manager Port :${port}`)
})