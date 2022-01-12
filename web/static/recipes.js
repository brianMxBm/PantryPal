import {RecipeModal} from "./modal.js";

/**
 * Recipe data from the Spoonacular API.
 *
 * @typedef {Object} Recipe
 * @property {number} id A unique identifier.
 * @property {string} title The recipe's title.
 * @property {string} image The recipe's image URL.
 * @property {number} missedIngredientCount
 *      The difference between the required ingredients and the user's ingredients.
 * @property {number} healthScore A percentage value indicating how healthy the recipe is.
 * @property {number} readyInMinutes The time in minutes for the recipe to be ready.
 * @property {number} pricePerServing The price per serving of the recipe in US cents.
 */

/**
 * Searches for recipes based on ingredients and displays recipe results & details.
 */
export class RecipeManager {
    /**
     * Create a RecipeManager instance.
     *
     * @param {IngredientManager} ingredientManager The object which provides inputted ingredients.
     * @param {Client} apiClient The client to use for performing API requests.
     */
    constructor(ingredientManager, apiClient) {
        this.ingredientManager = ingredientManager;
        this.api = apiClient;

        this.modal = undefined;
    }

    /**
     * Create a RecipeModal and add event listeners for the buttons.
     *
     * @param {HTMLElement} searchButton The button to trigger a recipe search.
     * @param {HTMLElement} missingButton The toggle for showing recipes with missing ingredients.
     * @param {HTMLElement} modal The element for the recipe details modal.
     */
    bind(searchButton, missingButton, modal) {
        this.modal = new RecipeModal(modal);

        searchButton.addEventListener("click", this.search.bind(this));
        missingButton.addEventListener("change", this.toggleMissing.bind(this));
    }

    /**
     * Create the query parameters for the search API request.
     *
     * Specify the user's inputted ingredients and the set search options.
     *
     * @returns {Object} The query parameters.
     */
    buildParams() {
        const sort = document.getElementById("sort");
        const type = document.getElementById("filter-type");
        const cuisine = document.getElementById("filter-cuisine");
        const time = document.getElementById("filter-time");

        // This is not efficient, but it's fine for the small amounts of ingredients.
        const ingredients = Array.from(
            this.ingredientManager.ingredients.values()
        );

        return {
            includeIngredients: ingredients.join(","),
            addRecipeInformation: "true",
            fillIngredients: "true",
            cuisine: cuisine.value,
            type: type.value,
            sort: sort.value,
            maxReadyTime: time.value,
        };
    }

    /**
     * Search for recipes and show all results.
     *
     * Use the user's inputted ingredients and set search options.
     *
     * @returns {Promise<void>}
     */
    async search() {
        // TODO: check response status code.
        const response = await this.api.get("search", this.buildParams());
        const results = await response.json();

        this.showAll(results.results);
    }

    /**
     * Show all given recipes.
     *
     * @param {Recipe[]} recipes The recipes to show.
     * @see show
     */
    showAll(recipes) {
        this.clear();
        for (const recipe of recipes) {
            this.show(recipe);
        }
    }

    /**
     * Show a recipe.
     *
     * Display its image along with some details: price, healthiness, and ready time.
     * Add a click event listener which will show the modal.
     *
     * @param {Recipe} recipe The recipe to show.
     */
    show(recipe) {
        const template = document.getElementById("recipe-template");
        const clone = template.cloneNode(true);

        clone.id = `recipe-${recipe.id}`;
        clone.querySelector(".recipe-name").textContent = recipe.title;
        clone.setAttribute("data-missing", recipe.missedIngredientCount > 0);

        const image = clone.querySelector(".recipe-img");
        image.src = recipe.image;
        image.addEventListener("click", (e) =>
            this.modal.show(e.target, recipe)
        );

        clone.querySelector(
            ".recipe-healthiness"
        ).textContent = `${recipe.healthScore}%`;

        clone.querySelector(
            ".recipe-time"
        ).textContent = `${recipe.readyInMinutes}m`;

        clone.querySelector(".recipe-price").textContent = (
            recipe.pricePerServing / 100
        ).toFixed(2);

        template.parentElement.appendChild(clone);
    }

    /**
     * Toggle the display of recipe search results which have missing ingredients.
     *
     * A result has missing ingredients if it requires ingredients that the user did not input.
     *
     * @param {Event} event The change event on the toggle button.
     */
    toggleMissing(event) {
        const recipes = document.querySelectorAll(".recipe");

        for (const recipe of recipes) {
            const isMissing = recipe.getAttribute("data-missing") === "true";
            if (event.target.checked && isMissing) {
                recipe.classList.add("d-none");
            } else {
                recipe.classList.remove("d-none");
            }
        }
    }

    /**
     * Remove all recipe search results from display.
     *
     * Remove all the elements from the DOM.
     */
    clear() {
        const template = document.getElementById("recipe-template");
        template.parentElement.replaceChildren(template);
    }
}