import {IngredientInput, IngredientManager} from "./ingredients.js";
import {RecipeManager} from "./recipes.js";
import {Client} from "./api.js";

const client = new Client();

const input = new IngredientInput(client);
const ingredientManager = new IngredientManager(input);
ingredientManager.bind(document.querySelector("#form-ingredients"));

// Dependency injection, wow!
const recipeManager = new RecipeManager(ingredientManager, client);
recipeManager.bind(
    document.querySelector("#button-search"),
    document.querySelector("#check-recipe-hide"),
    document.querySelector("#recipe-modal")
);