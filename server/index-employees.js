const express = require("express");
const cors = require("cors");
const { MongoClient,ObjectId } = require("mongodb");
const cron = require('node-cron');

const app = express();
app.use(express.json());
app.use(cors()); 
const mongoconnection='mongodb+srv://FirstMongo:mongo123@hospitalmanagementsyste.mq1fdvh.mongodb.net/'

app.listen(3000, () => {
    console.log("The server is running");
});

let MyConnectionDB;
let MyAttendanceConnectionDB;

MongoClient.connect(mongoconnection)
    .then((client) => {
        MyConnectionDB = client.db("Hospital_Management_");
        MyAttendanceConnectionDB=client.db("Hospital_Management_System");
        console.log('MongoDB connected successfully');
        
    })
    .catch(err => {
        console.log(err);
    });
    

app.get('/getuser', (req, res) => {
    res.json({ mssg: "Welcome to the api" });
});

app.get('/display', async (req, res) => {
    try {
        if (!MyConnectionDB) {
            return res.status(500).json({ error: "Database connection not established" });
        }
        const employee = await MyConnectionDB.collection("employees").find().toArray();
        res.status(200).json(employee);
        console.log(employee);
    } catch (error) {
        console.error("Error fetching employee:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



//update information
app.put("/update/:id", (req, res) => {
    MongoClient.connect(mongoconnection)
        .then(client => {
            const db = client.db("Hospital_Management_"); 
            
            const collection = db.collection("employees");
            
            const objectId = ObjectId.isValid(req.params.id) ? new ObjectId(req.params.id) : null;
            if (!objectId) {
                throw new Error('Invalid ObjectId');
            }
            const updateFields = { $set: req.body };
            
            return collection.updateOne(
                { _id: objectId },
                updateFields
            );
        })
        .then(result => {
            res.send(result);
        })
        .catch(error => {
            res.status(500).send(error.toString());
        })
    })
    // add a attendance into a database
app.post('/attendace', (req, res) => {
    MyAttendanceConnectionDB.collection('Attendance')
    .insertOne(req.body)
    .then((result) => {
        res.status(201).json(result)
    })
    .catch(err => {
        res.status(500).json({err: "Could not add the document"})
    })
})
//schedule to reste the Attendance
cron.schedule('0 1 * * *', async () => {
    try {
    
      const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();
  
      const database = client.db('Hospital_Management_');
      const collection = database.collection('employees');
  
      await collection.updateMany({}, { $set: { attendance: false } });
  
      console.log('Attendance reset successfully.');
  
      await client.close();
    } catch (error) {
      console.error('Error resetting attendance:', error);
    }
  });
