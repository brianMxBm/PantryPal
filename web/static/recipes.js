import {RecipeModal} from "./modal.js";

export class RecipeManager {
    constructor(ingredientManager, apiClient) {
        this.ingredientManager = ingredientManager;
        this.api = apiClient;

        this.modal = undefined;
    }

    bind(searchButton, missingButton, modal) {
        this.modal = new RecipeModal(modal);

        searchButton.addEventListener("click", this.search.bind(this));
        missingButton.addEventListener("change", this.toggleMissing.bind(this));
    }

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

    async search() {
        // TODO: check response status code.
        const response = await this.api.get("search", this.buildParams());
        const results = await response.json();

        this.showAll(results.results);
    }

    showAll(recipes) {
        this.clear();
        for (const recipe of recipes) {
            this.show(recipe);
        }
    }

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

        template.parentNode.appendChild(clone);
    }

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

    clear() {
        const template = document.getElementById("recipe-template");
        template.parentElement.replaceChildren(template);
    }
}