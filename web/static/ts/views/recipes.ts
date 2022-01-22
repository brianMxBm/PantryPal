import {IObserver} from "../observe";
import {Recipe} from "../models/spoonacular";
import {RecipesController} from "../controllers/recipes";

export class RecipesView implements IObserver<Recipe[]> {
    private readonly _controller: RecipesController;
    private readonly _template: HTMLElement;
    private readonly _parent: HTMLElement;

    constructor(
        searchButton: Element,
        missingToggle: Element,
        controller: RecipesController
    ) {
        this._controller = controller;

        const template = document.getElementById("recipe-template");
        if (template === null) {
            throw new TypeError("Cannot find the recipe template.");
        } else {
            this._template = template;
        }

        if (template.parentElement === null) {
            throw new TypeError("The recipe template doesn't have a parent.");
        } else {
            this._parent = template.parentElement;
        }

        searchButton.addEventListener("click", this._onSearch.bind(this));
        missingToggle.addEventListener(
            "change",
            this._toggleMissing.bind(this)
        );
    }

    public update(recipes: Recipe[]): void {
        this._clear();
        for (const recipe of recipes) {
            this._createElement(recipe);
        }
    }

    private _createElement(recipe: Recipe) {
        const clone = this._template.cloneNode(true) as Element;

        clone.id = `recipe-${recipe.id}`;
        clone.setAttribute(
            "data-missing",
            recipe.missedIngredientCount > 0 ? "true" : "false"
        );

        const name = clone.querySelector(".recipe-name");
        if (name === null) {
            throw new TypeError("Recipe template lacks a name element.");
        } else {
            name.textContent = recipe.title;
        }

        const image = clone.querySelector(".recipe-img");
        if (image === null) {
            throw new TypeError("Recipe template lacks an image element.");
        } else {
            (image as HTMLImageElement).src = recipe.image;
        }

        const health = clone.querySelector(".recipe-healthiness");
        if (health === null) {
            throw new TypeError("Recipe template lacks a health element.");
        } else {
            health.textContent = `${recipe.healthScore}%`;
        }

        const time = clone.querySelector(".recipe-time");
        if (time === null) {
            throw new TypeError("Recipe template lacks a time element.");
        } else {
            time.textContent = `${recipe.readyInMinutes}m`;
        }

        const price = clone.querySelector(".recipe-price");
        if (price === null) {
            throw new TypeError("Recipe template lacks a price element.");
        } else {
            price.textContent = (recipe.pricePerServing / 100).toFixed(2);
        }

        this._parent.appendChild(clone);
    }

    private _toggleMissing(event: Event) {
        const recipes = document.querySelectorAll(".recipe");

        for (const recipe of recipes) {
            const isMissing = recipe.getAttribute("data-missing") === "true";
            if ((event.target as HTMLInputElement).checked && isMissing) {
                recipe.classList.add("d-none");
            } else {
                recipe.classList.remove("d-none");
            }
        }
    }

    private _clear() {
        this._parent.replaceChildren(this._template);
    }

    private async _onSearch(): Promise<void> {
        const sort = document.getElementById("sort");
        const type = document.getElementById("filter-type");
        const cuisine = document.getElementById("filter-cuisine");
        const time = document.getElementById("filter-time");

        // Can't be bothered to create a separate check for each one.
        if (
            sort === null ||
            type === null ||
            cuisine === null ||
            time === null
        ) {
            throw new TypeError("Cannot find all search option elements.");
        }

        await this._controller.onSearch(
            (sort as HTMLSelectElement).value,
            (cuisine as HTMLSelectElement).value,
            (type as HTMLSelectElement).value,
            (time as HTMLInputElement).value
        );
    }
}