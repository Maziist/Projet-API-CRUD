const mongoose=require('mongoose');
const recipeSchema=new mongoose.Schema({
    title:{
        type:String,
        required:[true,"le titre est requis"]
    },
    ingredients:{
        type:[String],
        required:[true,"les ingrédients sont requis"]
    },
    instructions:{
        type:[String],
        required:[true,"l'instruction est requis"]
    },
    timeprepa:{
        type:String,
        required:[true,"le temps de preparation est requise"]
    },
    timecooking:{
        type:String,
        required:[true,"le temps de cuisson est requise"]
    },
    difficulty:{
        type:String,
        required:[true,"la difficulté est requise"]
    },
    category:{
        type:String,
        required:[true,"la catégorie est requise"]
    },
    image:{
        type:String //optionnelle 
    }
})
const recipeModel=mongoose.model('recipes', recipeSchema);
module.exports=recipeModel


// {
//     "title": "Gougères au comté",
//     "ingredients": [
//         "Comté 75g",
//         "Farine 125g",
//         "Sel 1/2 cuillère à café",
//         "Œuf(s) 3",
//         "Beurre 50g"
//     ],
//     "instructions": [
//         "Préchauffez le four à 180°C (thermostat 6).",
//         "Déposez dans une casserole le beurre coupé en morceaux. Faites-le fondre à feu doux avec le sel et 25 cl d’eau.",
//         "Lorsque le beurre est bien fondu, ajoutez la farine d’un seul coup. Mélangez vigoureusement à l’aide d’une spatule en bois, jusqu’à obtenir une pâte homogène, qui se décolle des parois de la casserole.",
//         "Ajoutez les œufs un à un en mélangeant bien à chaque fois.",
//          "Râpez le Comté et ajoutez-le à la pâte à chou. Mélangez-bien pour le répartir uniformément.",
//          "Couvrez une plaque de cuisson de papier sulfurisé. Déposez-y à l’aide de deux petites cuillères, des tas de pâte suffisamment espacés car ils vont gonfler à la cuisson."
//     ],
//     "timeprepa": "15 minutes",
//     "timecooking": "35 minutes",
//     "difficulty": "Facile",
//     "category": "Entrée"
// }