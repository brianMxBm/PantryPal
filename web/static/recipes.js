import {PaginatedModal} from "./modal.js";

export class RecipeManager {
    constructor(searchButtonId, ingredientManager) {
        this.ingredientManager = ingredientManager;

        this.searchButton = document.getElementById(searchButtonId);
        this.modalEl = document.getElementById("recipe-modal");
        this.modal = new PaginatedModal(this.modalEl);
    }

    bind() {
        this.searchButton.addEventListener("click", this.search.bind(this));
    }

    buildURL() {
        const sort = document.getElementById("sort");
        const type = document.getElementById("filter-type");
        const cuisine = document.getElementById("filter-cuisine");
        const time = document.getElementById("filter-time");

        // This is not efficient, but it's fine for the small amounts of ingredients.
        const ingredients = Array.from(
            this.ingredientManager.ingredients.values()
        );
        const params = {
            includeIngredients: ingredients.map((i) => i.name).join(","),
            addRecipeInformation: "true",
            fillIngredients: "true",
            cuisine: cuisine.value,
            type: type.value,
            sort: sort.value,
            maxReadyTime: time.value,
        };

        const url = new URL("api/search", window.location.href);
        Object.keys(params).forEach((key) =>
            url.searchParams.append(key, params[key])
        );

        return url;
    }

    async search() {
        const url = this.buildURL();

        // TODO: check response status code.
        const response = await fetch(url);
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

        const image = clone.querySelector(".recipe-img");
        image.src = recipe.image;
        image.addEventListener("click", (e) => this.showModal(e, recipe));

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

    showModal(event, recipe) {
        // TODO: avoid refilling if the same recipe is opened again.
        this.modalEl.querySelector(".modal-title").textContent = recipe.title;
        this.modalEl.querySelector("#summary").innerHTML = recipe.summary;
        this.modalEl.querySelector("#summary-img").src = recipe.image;

        this.fillInstructions(recipe);
        this.fillIngredients(recipe);

        // TODO: set active page to summary if it's a different recipe
        this.modal.show(event.target);
    }

    fillInstructions(recipe) {
        const orderedList = this.modalEl.querySelector("#instructions");
        orderedList.replaceChildren();

        for (const instructions of recipe.analyzedInstructions) {
            for (const step of instructions.steps) {
                const listItem = document.createElement("li");
                listItem.textContent = step.step;
                orderedList.appendChild(listItem);
            }
        }
    }

    fillIngredients(recipe) {
        const template = this.modalEl.querySelector("#req-ingr-template");
        template.parentElement.replaceChildren(template);

        for (const ingredient of recipe.extendedIngredients) {
            const clone = template.cloneNode(true);

            clone.id = `req-ingr-${ingredient.id}`;

            const name = clone.querySelector(".name");
            name.textContent = ingredient.name;

            const quantity = clone.querySelector(".quantity");
            quantity.textContent = `${+ingredient.amount.toFixed(2)} `;
            quantity.textContent += ingredient.unit;

            const image = clone.querySelector("img");
            const imageName = ingredient.image ?? "no.jpg";
            image.title = `${quantity.textContent} ${ingredient.name}`;
            image.src = `https://spoonacular.com/cdn/ingredients_100x100/${imageName}`;

            template.parentElement.appendChild(clone);
        }
    }

    clear() {
        const template = document.getElementById("recipe-template");
        template.parentElement.replaceChildren(template);
    }
}