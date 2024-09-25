const recipeRouter= require('express').Router()
const recipeModel=require('../Models/recipeModel')

recipeRouter.post('/recipes',async(req,res)=>{
try{
    const recipeData = { ...req.body };
    if (!recipeData.image || recipeData.image.trim() === '') {
        delete recipeData.image;
    }
    const requiredFields = ['title', 'ingredients', 'instructions', 'timeprepa', 'timecooking', 'difficulty', 'category'];
    for (let field of requiredFields) {
        if (!recipeData[field]) {
            return res.status(400).json({ error: `Le champ ${field} est requis.` });
        }
    }
    const newRecipe=new recipeModel(recipeData)
    await newRecipe.save()
    res.status(201).json(newRecipe);
}catch(error){
    console.error('Error creating recipe:', error);
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: 'Erreur de validation', details: error.message });
        } else {
            res.status(500).json({ error: 'Erreur serveur lors de la création de la recette' });
        }
}
});

recipeRouter.get('/recipes', async (req, res) => {
    try {
        const { name, difficulty, tempsprepa, category } = req.query;
        let query = {};

        if (name) {
            query.title = new RegExp(name.replace(/^["']|["']$/g, ''), 'i');
        }
        if (difficulty) {
            query.difficulty = new RegExp(difficulty, 'i');
        }
        if (category) {
            query.category = new RegExp(category, 'i');
        }
        if (tempsprepa) {
            query.tempsprepa = new RegExp(tempsprepa, 'i');
        }
        // if (ingredient) {
        //     query.ingredients = new RegExp(ingredient, 'i');
        // }

        // Recherche avancee
        // if (name || ingredient || category||instructions||timeprepa||timecooking||difficulty) {
        //     query.title = new RegExp(name.replace(/^["']|["']$/g, ''), 'i');
        //     query.ingredients = new RegExp(ingredient, 'i');
        //     query.category = new RegExp(category, 'i');
        //     query.instructions = new RegExp(ingredient, 'i');
        //     query.timeprepa = new RegExp(ingredient, 'i');
        //     query.timecooking = new RegExp(ingredient, 'i');
        //     query.difficulty = new RegExp(ingredient, 'i');
        // }

        const recipes = await recipeModel.find(query)

        if (recipes.length > 0) {
            res.json(recipes);
        } else {
            res.status(404).json({ message: "Aucune recette n'a été trouvée" });
        }
    } catch (error) {
        console.error("Error fetching recipes:", error);
        res.status(500).json({ error: "Une erreur est survenue lors de la récupération des recettes" });
    }
});

recipeRouter.get('/recipes/:id', async (req, res) => {
    try {
        const recipe = await recipeModel.findById(req.params.id);
        if (recipe) {
            res.json(recipe);
        } else {
            res.status(404).json({ message: "Recette non trouvée" });
        }
    } catch (error) {
        console.error("Error fetching recipe:", error);
        res.status(500).json({ error: "Une erreur est survenue lors de la récupération de la recette" });
    }
});

    recipeRouter.put('/recipes/:id', async (req, res) => {
        try {
            await recipeModel.updateOne({ _id: req.params.id }, req.body)
            res.json({ message: "le recette a bien été modifiée" })
        } catch (error) {
            res.json(error)
        }
    });
    recipeRouter.delete('/recipes/:id', async (req, res) => {
        try {
            await recipeModel.deleteOne({ _id: req.params.id })
            res.json({ message: "le recette a bien été supprimée" })
        } catch (error) {
            res.json(error)
        }
    });
    module.exports=recipeRouter
