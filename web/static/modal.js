export class PaginatedModal extends bootstrap.Modal {
    constructor(element, config) {
        super(element, config);

        for (const pageLink of this._element.querySelectorAll(".page-link")) {
            pageLink.addEventListener("click", this._changePage.bind(this));
        }
    }

    _changePage(event) {
        const activeLink = this._element.querySelector(
            ".page-item.active .page-link"
        );
        if (event.target === activeLink) {
            // Exit early if the selected page is already the current page.
            return;
        }

        let pageClass = activeLink.getAttribute("data-page");

        // Hide the current page and make it inactive.
        this._element.querySelector(pageClass).classList.add("d-none");
        activeLink.removeAttribute("aria-current");
        activeLink.parentElement.classList.remove("active");

        // Show the selected page and make it active.
        pageClass = event.target.getAttribute("data-page");
        this._element.querySelector(pageClass).classList.remove("d-none");
        event.target.setAttribute("aria-current", "page");
        event.target.parentElement.classList.add("active");
    }
}

export class RecipeModal extends PaginatedModal {
    constructor(element, config) {
        super(element, config);
        this._prevRecipeID = undefined;
    }

    toggle(relatedTarget, recipe) {
        return this._isShown ? this.hide() : this.show(relatedTarget, recipe);
    }

    show(relatedTarget, recipe) {
        if (this._prevRecipeID !== recipe.id) {
            this._fillSummary(recipe);
            this._fillIngredients(recipe);
            this._fillInstructions(recipe);
        }

        // TODO: set active page to summary if it's a different recipe.
        this._prevRecipeID = recipe.id;
        return super.show(relatedTarget);
    }

    _fillSummary(recipe) {
        this._element.querySelector(".modal-title").textContent = recipe.title;
        this._element.querySelector("#summary").innerHTML = recipe.summary;
        this._element.querySelector("#summary-img").src = recipe.image;
    }

    _fillInstructions(recipe) {
        const orderedList = this._element.querySelector("#instructions");
        orderedList.replaceChildren();

        for (const instructions of recipe.analyzedInstructions) {
            for (const step of instructions.steps) {
                const listItem = document.createElement("li");
                listItem.textContent = step.step;
                orderedList.appendChild(listItem);
            }
        }
    }

    _fillIngredients(recipe) {
        const template = this._element.querySelector("#req-ingr-template");
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
}