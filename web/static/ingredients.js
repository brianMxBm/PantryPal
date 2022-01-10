import {Autocomplete} from "./vendored/autocomplete.js";
import {diff} from "./vendored/levenshtein.js";

export class IngredientInput {
    constructor(apiClient) {
        this._api = apiClient;

        this._input = undefined;
        this._inputCount = 0;
        this._lastInput = "";
        this._lastInputTime = 0;

        this._selection = undefined;

        this._autocomplete = undefined;
        this._acOptions = {
            label: "name",
            value: "image",
            treshold: 3, // Yes, it's misspelled in the lib.
            onSelectItem: this._onSelectItem.bind(this),
            onInput: this._onInput.bind(this),
            data: [],
        };
    }

    get element() {
        return this._input;
    }

    bind(form, onSubmit) {
        this._input = form.querySelector("input[type='search']");
        this._lastInput = this._input.value;
        this._autocomplete = new Autocomplete(this._input, this._acOptions);

        // Call the provided callback when the form is submitted.
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            onSubmit(e, this._selection);
        });
    }

    async _getData() {
        const params = {
            query: this._input.value,
            number: 100,
        };

        // TODO: check the returned status code.
        // TODO: check for empty input.
        const response = await this._api.get("ingredients", params);

        return await response.json();
    }

    _onInput(value) {
        if (value === this._lastInput) {
            return;
        }

        const passedThreshold = value.length >= this._acOptions.treshold;
        const time = performance.now();
        const delta = time - this._lastInputTime;

        this._inputCount += diff(value, this._lastInput);
        this._lastInput = value;
        this._lastInputTime = time;

        // Clear the count if the input is cleared.
        if (value.length === 0) {
            this._inputCount = 0;
            return;
        }

        // Get data when 3 more chars are entered or its been more than 1.5s.
        if (passedThreshold && (this._inputCount >= 3 || delta >= 1500)) {
            this._inputCount = 0;

            // See how many matches there are against the current data.
            const items = this._autocomplete.createItems();

            // Get new data if there aren't enough matches in the current data.
            if (items < this._autocomplete.options.maximumItems) {
                this._getData().then((data) =>
                    this._autocomplete.setData(data)
                );
            }
        }
    }

    _onSelectItem(item) {
        this._selection = item;
        this._input.focus();
        this._autocomplete.dropdown.hide();
    }
}

export class IngredientManager {
    constructor(input) {
        this.input = input;
        this.ingredients = new Set();

        this.toolTipOptions = {
            html: true,
            template: `
                <div class="tooltip ingredient-tooltip" role="tooltip">
                    <div class="tooltip-arrow"></div>
                    <div class="tooltip-inner border bg-light"></div>
                </div>`,
        };
    }

    bind(form) {
        this.input.bind(form, this.add.bind(this));
    }

    add(event, selection) {
        if (this.input.element.value !== selection?.label) {
            // TODO: display error because the input doesn't match a selection.
            return;
        } else if (!this.ingredients.has(selection.label)) {
            this.ingredients.add(selection.label);
            const node = this.show(selection.label);
            this.addToolTip(node, selection.value || "no.png");
        } else {
            // TODO: display a message because a duplicate is entered.
        }

        this.input.element.value = ""; // Clear the input bar.
    }

    show(name) {
        const template = document.getElementById("ingredient-template");

        const clone = template.cloneNode(true);
        clone.removeAttribute("id");
        clone.firstElementChild.textContent = name;
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
            event.target.parentNode.firstElementChild.textContent
        );
        event.target.parentNode.remove();
    }
}