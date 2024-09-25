const cors = require('cors');
const express = require('express')
const mongoose = require("mongoose")
const recipeRouter = require('./Router/recipeRouter')
const userRouter = require('./Router/userRouter')

const app = express()

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(recipeRouter)
app.use(userRouter)

app.listen(3000, (err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log('server is running on port 3000');
    }
})
mongoose.connect("mongodb://127.0.0.1:27017/recipes")