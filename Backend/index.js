const express = require('express')
const app = express()
const port = 5000
const connectToMongo = require("./db");
const cors = require('cors');
const upload = require('./middleware/multer');

connectToMongo();

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Adjust allowed methods as needed
    allowedHeaders: ['Content-Type', 'auth-token'], // Adjust allowed headers as needed
}));


//middleware
app.use(express.json({ limit: '10mb' }));
app.use("/", express.static("public/upload"));

//available routes
app.get('/', (req, res) => {
    res.send('hello world')
})
app.use('/api/auth', require("./routes/auth"))
app.use('/api/notes', require("./routes/notes"))

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)
})