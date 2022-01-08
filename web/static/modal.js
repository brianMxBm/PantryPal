export class PaginatedModal extends bootstrap.Modal {
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

    setPage(pageNum) {
        this._setPage(this._pageLinks[pageNum - 1]);
    }
}

export class RecipeModal extends PaginatedModal {
    constructor(element, config) {
        super(element, config);
        this._prevRecipeID = undefined;

        const radios = this._element.querySelectorAll("#radio-units input");
        for (const radio of radios) {
            radio.addEventListener("change", this._changeAllUnits.bind(this));
        }
    }

    toggle(relatedTarget, recipe) {
        return this._isShown ? this.hide() : this.show(relatedTarget, recipe);
    }

    show(relatedTarget, recipe) {
        if (this._prevRecipeID !== recipe.id) {
            this._fillSummary(recipe);
            this._fillIngredients(recipe);
            this._fillEquipment(recipe);
            this._fillInstructions(recipe);

            this.setPage(1);
        }

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
            const node = this._createRequirement(
                ingredient,
                template,
                "ingredients"
            );

            // Save quantity strings in both units.
            for (const unitType of ["metric", "us"]) {
                const measure = ingredient.measures[unitType];
                const amount = `${+measure.amount.toFixed(2)} `;
                node.setAttribute(
                    `data-${unitType}`,
                    (amount + measure.unitShort).trim()
                );
            }

            node.setAttribute("data-name", ingredient.name);
            this._changeUnits(node);
        }
    }

    _fillEquipment(recipe) {
        const template = this._element.querySelector("#req-equip-template");
        template.parentElement.replaceChildren(template);

        for (const instructions of recipe.analyzedInstructions) {
            for (const step of instructions.steps) {
                for (const equip of step.equipment) {
                    this._createRequirement(equip, template, "equipment");
                }
            }
        }
    }

    _createRequirement(data, template, type) {
        const clone = template.cloneNode(true);
        clone.id = `req-${type}-${data.id}`;

        const name = clone.querySelector(".name");
        name.textContent = data.name;

        const image = clone.querySelector("img");
        const imageName = data.image || "no.png";
        image.src = `https://spoonacular.com/cdn/${type}_100x100/${imageName}`;

        template.parentElement.appendChild(clone);
        return clone;
    }

    _changeUnits(ingredient) {
        const checked = this._element.querySelector(
            "#radio-units input:checked"
        );
        const unitType = checked.getAttribute("data-unit");

        const quantity = ingredient.querySelector(".quantity");
        quantity.textContent = ingredient.getAttribute(`data-${unitType}`);

        const image = ingredient.querySelector("img");
        const name = ingredient.getAttribute("data-name");
        image.title = `${quantity.textContent} ${name}`.trim();
    }

    _changeAllUnits(event) {
        if (!event.target.checked) {
            return;
        }

        const ingredients = this._element.querySelectorAll(".req-ingr");
        for (const ingredient of ingredients) {
            this._changeUnits(ingredient);
        }
    }
}