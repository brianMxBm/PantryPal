import {IngredientInput, IngredientManager} from "./ingredients.js";
import {RecipeManager} from "./recipes.js";

const input = new IngredientInput();
const ingredientManager = new IngredientManager(input);
ingredientManager.bind(document.querySelector("#form-ingredients"));

// Dependency injection, wow!
const recipeManager = new RecipeManager(
    "button-search",
    "check-recipe-hide",
    ingredientManager
);
recipeManager.bind();