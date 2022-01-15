/**
 * A Bootstrap Modal with different pages for the body.
 *
 * Expects a Bootstrap pagination component in the modal's footer.
 */
 export class PaginatedModal extends bootstrap.Modal {
    /**
     * Create a PaginatedModal instance.
     *
     * @param {HTMLElement} element The element for the modal.
     * @param {Object} config The configuration for the Bootstrap Modal.
     */
    constructor(element, config) {
        super(element, config);
        this._pageLinks = [];

        const links = this._element.querySelectorAll(
            ".modal-footer .page-link"
        );
        for (const link of links) {
            this._pageLinks.push(link);
            link.addEventListener("click", (e) => this._setPage(e.target));
        }
    }

    /**
     * Set the active page of the modal based on a provided anchor element.
     *
     * @param {HTMLAnchorElement} target
     * @private
     */
    _setPage(target) {
        const activeLink = this._element.querySelector(
            ".modal-footer .page-item.active .page-link"
        );
        if (target === activeLink) {
            // Exit early if the selected page is already the current page.
            return;
        }

        let pageClass = activeLink.getAttribute("data-page");

        // Hide the current page and make it inactive.
        this._element.querySelector(pageClass).classList.add("d-none");
        activeLink.removeAttribute("aria-current");
        activeLink.parentElement.classList.remove("active");

        // Show the selected page and make it active.
        pageClass = target.getAttribute("data-page");
        this._element.querySelector(pageClass).classList.remove("d-none");
        target.setAttribute("aria-current", "page");
        target.parentElement.classList.add("active");
    }

    /**
     * Set the active page of the modal based on the page number.
     *
     * @param {number} pageNum The page number to make active (starts at 1).
     */
    setPage(pageNum) {
        this._setPage(this._pageLinks[pageNum - 1]);
    }
}

/**
 * A paginated modal for displaying recipe details.
 *
 * Has three pages:
 * 1. Summary
 * 2. Requirements
 * 3. Instructions
 *
 * The requirements page displays both ingredients and equipment.
 * The ingredient's units can be toggled between US and metric.
 */
export class RecipeModal extends PaginatedModal {
    /**
     * Create a RecipeModal instance.
     *
     * @param {HTMLElement} element The element for the modal.
     * @param {Object} config The configuration for the Bootstrap Modal.
     */
    constructor(element, config) {
        super(element, config);

        this._recipe = undefined;
        this._ingredients = new Map();

        const radios = this._element.querySelectorAll("#radio-units input");
        for (const radio of radios) {
            radio.addEventListener("change", this._changeAllUnits.bind(this));
        }
    }

    /**
     * Manually toggles opening the modal with details for the given recipe.
     *
     * @param {HTMLElement} relatedTarget An element to pass to the modal's events.
     * @param {Recipe} recipe The recipe for which to display details.
     */
    toggle(relatedTarget, recipe) {
        this._isShown ? this.hide() : this.show(relatedTarget, recipe);
    }

    /**
     * Manually opens the modal with details for the given recipe.
     *
     * @param {HTMLElement} relatedTarget An element to pass to the modal's events.
     * @param {Recipe} recipe The recipe for which to display details.
     */
    show(relatedTarget, recipe) {
        if (this._recipe?.id !== recipe.id) {
            this._recipe = recipe;

            this._fillSummary();
            this._fillIngredients();
            this._fillEquipment();
            this._fillInstructions();
            this._fillShoppingList();

            this.setPage(1);
        }

        super.show(relatedTarget);
    }

    /**
     * Fill the summary page with the summary and image of the given recipe.
     * @private
     */
    _fillSummary() {
        this._element.querySelector(".modal-title").textContent =
            this._recipe.title;
        this._element.querySelector("#summary").innerHTML =
            this._recipe.summary;
        this._element.querySelector("#summary-img").src = this._recipe.image;
    }

    /**
     * Fill the instructions page with instructions for the given recipe.
     * @private
     */
    _fillInstructions() {
        const orderedList = this._element.querySelector("#instructions");
        orderedList.replaceChildren();

        for (const instructions of this._recipe.analyzedInstructions) {
            for (const step of instructions.steps) {
                const listItem = document.createElement("li");
                listItem.textContent = step.step;
                orderedList.appendChild(listItem);
            }
        }
    }

    /**
     * Fill the requirements page with ingredients for the given recipe.
     * @private
     */
    _fillIngredients() {
        const template = this._element.querySelector("#req-ingr-template");
        template.parentElement.replaceChildren(template);
        this._ingredients.clear();

        for (const data of this._recipe.extendedIngredients) {
            const ingredient = {
                data: data,
                element: this._createRequirement(data, template, "ingredients"),
                listElement: undefined,
            };

            this._ingredients.set(data.id, ingredient);
            this._changeUnits(ingredient.element, data);
        }
    }

    /**
     * Fill the requirements page with a list of missing ingredients.
     * @private
     */
    _fillShoppingList() {
        const orderedList = this._element.querySelector("#req-shopping");
        orderedList.replaceChildren();

        for (const data of this._recipe.missedIngredients) {
            const ingredient = this._ingredients.get(data.id);
            ingredient.listElement = document.createElement("li");

            this._changeShoppingUnits(ingredient.listElement, ingredient.data);
            orderedList.appendChild(ingredient.listElement);
        }
    }

    /**
     * Fill the requirements page with equipment for the given recipe.
     * @private
     */
    _fillEquipment() {
        const template = this._element.querySelector("#req-equip-template");
        template.parentElement.replaceChildren(template);

        const seen = new Set(); // Used to skip duplicate equipment.

        for (const instructions of this._recipe.analyzedInstructions) {
            for (const step of instructions.steps) {
                for (const equip of step.equipment) {
                    if (!seen.has(equip.id)) {
                        this._createRequirement(equip, template, "equipment");
                        seen.add(equip.id);
                    }
                }
            }
        }
    }

    /**
     * Create an element containing a recipe requirement's information.
     *
     * @param {Requirement} data The requirement's information.
     * @param {HTMLElement} template The template element to use for displaying the requirement.
     * @param {string} type The name of the requirement type; used to create the image URL.
     * @returns {HTMLElement} The element created to display the requirement.
     * @private
     */
    _createRequirement(data, template, type) {
        const clone = template.cloneNode(true);
        clone.id = `req-${type}-${data.id}`;

        const name = clone.querySelector(".name");
        name.textContent = data.name;

        const image = clone.querySelector("img");
        const imageName = data.image || "no.png";
        image.src = `https://spoonacular.com/cdn/${type}_100x100/${imageName}`;
        image.title = data.name;

        template.parentElement.appendChild(clone);
        return clone;
    }

    /**
     * Change the units used to display the ingredient's quantity.
     *
     * Toggle between metric and US units.
     *
     * @param {HTMLElement} element The element displaying the ingredient.
     * @param {Ingredient} data The data for the ingredient.
     * @private
     */
    _changeUnits(element, data) {
        const quantity = this._getQuantityText(data);
        element.querySelector(".quantity").textContent = quantity;
        element.querySelector("img").title = `${quantity} ${data.name}`.trim();
    }

    /**
     * Change the units used to display the quantity of an ingredient in the shopping list.
     *
     * @param {HTMLElement} element The element displaying the ingredient in the shopping list.
     * @param {Ingredient} data The data for the ingredient.
     * @private
     */
    _changeShoppingUnits(element, data) {
        const quantity = this._getQuantityText(data);
        element.textContent = data.name;
        if (quantity.length > 0) {
            element.textContent += `, ${quantity}`.trim();
        }
    }

    /**
     * Change the units used to display the all ingredients' quantities.
     *
     * Toggle between metric and US units.
     *
     * @param {Object} event The event that triggered the radio button.
     * @see _changeUnits
     * @private
     */
    _changeAllUnits(event) {
        if (!event.target.checked) {
            return;
        }

        for (const ingredient of this._ingredients.values()) {
            this._changeUnits(ingredient.element, ingredient.data);
            if (ingredient.listElement !== undefined) {
                this._changeShoppingUnits(
                    ingredient.listElement,
                    ingredient.data
                );
            }
        }
    }

    /**
     * Get a string representation of an ingredient's quantity in the selected units.
     *
     * The units can be selected by the user by clicking on radio buttons.
     *
     * @param {Ingredient} ingredient The ingredient's information.
     * @returns {string} A string representation of the quantity.
     * @private
     */
    _getQuantityText(ingredient) {
        const checked = this._element.querySelector(
            "#radio-units input:checked"
        );
        const unitType = checked.getAttribute("data-unit");

        const measure = ingredient.measures[unitType];
        return `${+measure.amount.toFixed(2)} ${measure.unitShort}`.trim();
    }
}