export class RecipeManager {
    constructor(searchButtonId, ingredientManager) {
        this.ingredientManager = ingredientManager;

        this.searchButton = document.getElementById(searchButtonId);
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
        for (const result of recipes) {
            this.show(result);
        }
    }

    show(recipe) {
        const template = document.getElementById("recipe-template");
        const clone = template.cloneNode(true);

        clone.id = `recipe-${recipe.id}`;
        clone.querySelector(".recipe-name").textContent = recipe.title;
        clone.querySelector(".recipe-img").src = recipe.image;

        clone.querySelector(
            ".recipe-healthiness"
        ).textContent = `${recipe.healthScore}%`;

        clone.querySelector(
            ".recipe-time"
        ).textContent = `${recipe.readyInMinutes} m`;

        clone.querySelector(".recipe-price").textContent = (
            recipe.pricePerServing / 100
        ).toFixed(2);

        template.parentNode.appendChild(clone);
    }

    clear() {
        const template = document.getElementById("recipe-template");
        template.parentElement.innerHTML = template.outerHTML;
    }
}