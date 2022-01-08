import {IngredientManager} from "./ingredients.js";
import {RecipeManager} from "./recipes.js";

const ingredientManager = new IngredientManager(
    "button-add-ingredient",
    "ingredient-input"
);
ingredientManager.bind();

// Dependency injection, wow!
const recipeManager = new RecipeManager(
    "button-search",
    "check-recipe-hide",
    ingredientManager
);
recipeManager.bind();