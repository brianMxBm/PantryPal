export class IngredientManager {
    constructor(addButtonId, inputId) {
        this.ingredients = new Map();
        this.toolTipOptions = {
            html: true,
            template: `
                <div class="tooltip ingredient-tooltip" role="tooltip">
                    <div class="tooltip-arrow"></div>
                    <div class="tooltip-inner border bg-light"></div>
                </div>`,
        };

        this.addButton = document.getElementById(addButtonId);
        this.input = document.getElementById(inputId);
    }

    bind() {
        this.addButton.addEventListener("click", this.add.bind(this));
        this.input.addEventListener("keyup", this.addOnEnterKey.bind(this));
    }

    async parseInput() {
        // TODO: check the returned status code.
        // TODO: check for empty input.
        const response = await fetch("api/ingredients", {
            method: "POST",
            body: new URLSearchParams({
                ingredientList: this.input.value,
            }),
        });

        // The API returns a list because it parses each line of input.
        // However, ingredients come from the front end 1 by 1,
        // so only use the first list item.
        return (await response.json())[0];
    }

    async add() {
        const info = await this.parseInput();

        // TODO: display a message when a duplicate is entered.
        // Store the ID as a string because it may later be read from an
        // attribute as a string.
        if (!this.ingredients.has(info.id.toString())) {
            this.ingredients.set(info.id.toString(), info);
            const node = this.show(info);
            this.addToolTip(node, info.image ?? "no.jpg");
        }

        this.input.value = ""; // Clear the input bar.
    }

    show(info) {
        const template = document.getElementById("ingredient-template");

        // Create an element for the new ingredient by cloning the template.
        const clone = template.cloneNode(true);

        // Fill in the template with the actual ingredient data.
        clone.id = `ingredient-${info.id}`;
        clone.firstElementChild.textContent = `${info.name}, ${info.amount} ${info.unitShort}`;

        // Used to delete it from the map.
        clone.setAttribute("data-id", info.id);

        clone
            .querySelector(".btn-close")
            .addEventListener("click", this.delete.bind(this));

        return template.parentNode.appendChild(clone);
    }

    addToolTip(node, image) {
        // Initialise the tooltip for the new element.
        // Display the ingredient's image on hover.
        const title = `<img src="https://spoonacular.com/cdn/ingredients_100x100/${image}">`;
        const tooltip = new bootstrap.Tooltip(node, {
            container: node,
            title: title,
            ...this.toolTipOptions,
        });

        // Hide the tooltip when hovering over it. Therefore, in practice,
        // the tooltip will only show when hovering over the `clone` element
        // created above. This is done to avoid obstructing adjacent
        // ingredients with the tooltip.
        node.addEventListener("shown.bs.tooltip", () => {
            tooltip
                .getTipElement()
                .addEventListener("pointerenter", () => tooltip.hide());
        });
    }

    delete(event) {
        bootstrap.Tooltip.getInstance(event.target.parentNode).dispose();
        this.ingredients.delete(
            event.target.parentNode.getAttribute("data-id")
        );
        event.target.parentNode.remove();
    }

    async addOnEnterKey(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            await this.add();
        }
    }
}