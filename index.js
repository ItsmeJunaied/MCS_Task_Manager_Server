require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();
const cors = require('cors');


const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
  optionSuccessStatus: 200,
};


app.use(cors(corsOptions))

app.use(express.json());
//middleware
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_Password}@cluster0.zj6nics.mongodb.net/?retryWrites=true&w=majority`;


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

    const TaskData = client.db('TaskData').collection('Task');
    const userData = client.db("TaskData").collection("users");
    const CommentData = client.db("TaskData").collection("Comment");

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
    // get user
    app.get('/users', async (req, res) => {
      const result = await userData.find().toArray();
      res.send(result);
    })

    //get all data
    app.get('/allLostandFound', async (req, res) => {
      const result = await TaskData.find().toArray();
      res.send(result);
    })
    //adding Task through post method
    app.post('/Task', async (req, res) => {
      const task = req.body;
      console.log(task);
      const result = await TaskData.insertOne(task);
      res.send(result);
    })
    //comment
    app.post('/comment', async (req, res) => {
      const comment = req.body;
      // console.log(task);
      const result = await CommentData.insertOne(comment);
      res.send(result);
    })
    //get comment
    app.get('/comment', async (req, res) => {
      const result = await CommentData.find().toArray();
      res.send(result);
    })
    //showing added task by email

    app.get('/Task', async (req, res) => {
      let data = {};

      if (req.query?.email) {
        data = { email: req.query.email }
      }
      const result = await TaskData.find(data).toArray();

      res.send(result);
    })

    //showing added task by id
    app.get('/Task/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await TaskData.findOne(query);
      res.send(result);
    })
    //delete by id
    app.delete('/Task/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }

      const result = await TaskData.deleteOne(query);
      res.send(result);
    })

    //update status
    app.patch('/Task/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const TaskUpdateing = req.body;

      const updateDoc = {
        $set: {
          status: TaskUpdateing.status
        },
      };

      const result = await TaskData.updateOne(filter, updateDoc);
      res.send(result);
    })


    //feedback post
    app.patch('/comment/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          feedback: req.body.feedback
        }
      };

      try {
        const result = await CommentData.updateOne(filter, updateDoc);
        res.json({ success: result.modifiedCount > 0 });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });


    // update task
    app.patch('/update/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedFields = req.body;
  
      try {
          const result = await TaskData.updateOne(filter, { $set: updatedFields });
          res.json(result);
      } catch (error) {
          console.error(error);
          res.status(500).json({ success: false, message: 'Internal server error' });
      }
  });
  

    // Handle PATCH request to update status and increment point
    // Update task status and point
    app.patch('/Task/:id', async (req, res) => {
      try {
        const taskId = req.params.id;
        const { status, point } = req.body;

        // Update the task in the database
        const updatedTask = await Task.findByIdAndUpdate(
          taskId,
          { status, point },
          { new: true }
        );

        if (!updatedTask) {
          return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({ success: true, message: 'Task updated successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    });

    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Task Manager server is runing')
})

app.listen(port, () => {
  console.log(`Task Manager Port :${port}`)
})