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
            fillInstructions:"true",
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

        clone.querySelector(
            ".recipe-healthiness"
        ).textContent = `${recipe.healthScore}%`;

        clone.querySelector(
            ".recipe-time"
        ).textContent = `${recipe.readyInMinutes}m`;

        clone.querySelector(".recipe-price").textContent = (
            recipe.pricePerServing / 100
        ).toFixed(2);

        const modal = clone.querySelector("#recipe-modal-template");
        this.fillModal(modal, image, recipe);

        template.parentNode.appendChild(clone);
    }

    fillModal(modal, trigger, recipe) {
        modal.id = `recipe-modal-${recipe.id}`;
        modal.querySelector(".modal-title").textContent = recipe.title;
        modal.querySelector(".recipe-summary").innerHTML = recipe.summary;
        modal.querySelector(".recipe-modal-img").src = recipe.image;
        this.fillInstructions(modal, recipe);

        // Needed for Bootstrap to be able to toggle this modal.
        trigger.setAttribute("data-bs-target", "#" + modal.id);

        // Set click events for pagination.
        for (const pageLink of modal.querySelectorAll(".page-link")) {
            pageLink.addEventListener("click", (e) =>
                this.changeModalPage(e, modal)
            );
        }
    }

    fillInstructions(modal, recipe) {
        const orderedList = modal.querySelector(".recipe-instructions");

        for (const instructions of recipe.analyzedInstructions) {
            for (const step of instructions.steps) {
                const listItem = document.createElement("li");
                listItem.textContent = step.step;
                orderedList.appendChild(listItem);
            }
        }
    }

    changeModalPage(event, modal) {
        const activeLink = modal.querySelector(".page-item.active .page-link");
        if (event.target === activeLink) {
            // Exit early if the selected page is already the current page.
            return;
        }

        let pageClass = activeLink.getAttribute("data-page");

        // Hide the current page and make it inactive.
        modal.querySelector(pageClass).classList.add("d-none");
        activeLink.removeAttribute("aria-current");
        activeLink.parentElement.classList.remove("active");

        // Show the selected page and make it active.
        pageClass = event.target.getAttribute("data-page");
        modal.querySelector(pageClass).classList.remove("d-none");
        event.target.setAttribute("aria-current", "page");
        event.target.parentElement.classList.add("active");
    }

    clear() {
        const template = document.getElementById("recipe-template");
        template.parentElement.innerHTML = template.outerHTML;
    }
}