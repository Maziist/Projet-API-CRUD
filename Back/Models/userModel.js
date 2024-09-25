const mongoose= require('mongoose');
const userModel= new mongoose.Schema({
    username:{
        type:String,
        required:[true,"le nom d'utilisateur est requis"]
    },
    password:{
        type:String,
        required:[true,"le mot de passe est requis"]
    }
})

const usermodel=mongoose.model('users', userModel);
module.exports=usermodel