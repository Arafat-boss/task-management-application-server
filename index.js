require("dotenv").config(); // dotenv ইম্পোর্ট করে এনভায়রনমেন্ট ভ্যারিয়েবল লোড করা
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ybjyx.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("TaskManagement");
    const allTaskCollection = database.collection("All-Tasks");

    app.post("/tasks", async (req, res) => {
      const data = req.body;
      const result = await allTaskCollection.insertOne(data);
      res.send(result);
    });
    app.get("/tasks/:email", async (req, res) => {
      const email = req.params.email;
      const query = {email: email}
      const result = await allTaskCollection.find(query).toArray();
      res.send(result);
    });


    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allTaskCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const updatedTask = req.body; // ক্লায়েন্ট থেকে আসা নতুন তথ্য
      const query = { _id: new ObjectId(id) };

      const updateDoc = {
        $set: {
          title: updatedTask.title,
          description: updatedTask.description,
        },
      };

      try {
        const result = await allTaskCollection.updateOne(query, updateDoc);
        res.send(result);
      } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).send({ message: "Failed to update task" });
      }
    });
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Task Management Application is Running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
