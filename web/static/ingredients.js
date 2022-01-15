import {Autocomplete} from "./vendored/autocomplete.js";
import {diff} from "./vendored/levenshtein.js";

/**
 * Retrieves and validates user inputs for ingredients.
 *
 * Adds autocompletion to a form, using data from Spoonacular.
 */
export class IngredientInput {
    /**
     * Create an IngredientInput instance.
     *
     * @param {Client} apiClient The client to use for performing API requests.
     */
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

    /**
     * Get the text input element used to input ingredients.
     *
     * @returns {HTMLInputElement} The input element.
     */
    get element() {
        return this._input;
    }

    /**
     * Attach an autocomplete dropdown and set up the form submit event listener.
     *
     * @param {HTMLFormElement} form The form used to input ingredients.
     * @param {IngredientInput~SubmitCallback} onSubmit The callback for the form submit event.
     */
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

    /**
     * Get ingredient autocomplete data for the current user input.
     *
     * Perform an API call to retrieve 100 matches for the current input.
     *
     * @returns {Promise<any>} The deserialised JSON response.
     * @private
     */
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

    /**
     * Conditionally update the autocomplete data.
     *
     * Update the data if at least 3 characters in the input were changed, added, or removed.
     * Also update if more than 1.5 seconds have elapsed since the last input.
     * Do not update if the current data still has enough matches to fill the autocomplete dropdown.
     *
     * These conditions are in place to conserve API quota limits.
     *
     * @param {string} value The value inputted by the user.
     * @private
     */
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

    /**
     * Save the user's autocompleted selection and hide the autocomplete dropdown.
     *
     * @param {Autocomplete~Selection} item The user's autocompleted ingredient selection.
     * @private
     */
    _onSelectItem(item) {
        this._selection = item;
        this._input.focus();
        this._autocomplete.dropdown.hide();
    }

    /**
     * A possible ingredient selection in the autocomplete dropdown menu.
     *
     * @typedef {Object} IngredientInput~Selection
     *
     * @property {string} label The ingredient's name
     * @property {string} value The ingredient's image's file name.
     */

    /**
     * Function to call when the ingredient input form is submitted.
     *
     * @callback IngredientInput~SubmitCallback
     *
     * @param {SubmitEvent} event The submit event that triggered the event listener.
     * @param {IngredientInput~Selection} selection The user's last autocomplete selection.
     */
}

/**
 * Displays or removes inputted ingredients.
 */
export class IngredientManager {
    /**
     * Create an IngredientManager instance.
     *
     * @param {IngredientInput} input The object which manages the ingredient input form.
     */
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

    /**
     * Set up event handlers for the ingredient input form.
     *
     * @param {HTMLFormElement} form The form to which to bind the IngredientInput.
     */
    bind(form) {
        this.input.bind(form, this.add.bind(this));

        // Delete all ingredients when the reset button is clicked.
        form.addEventListener("reset", this.deleteAll.bind(this));
    }

    /**
     * Add a new ingredient.
     *
     * Add the ingredient to the set and then display the new ingredient.
     *
     * @param {SubmitEvent} event The event triggered by the user adding the ingredient.
     * @param {IngredientInput~Selection} selection The user's last autocomplete selection.
     */
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

    /**
     * Display an ingredient.
     *
     * Display the ingredient's name with a remove button beside it.
     *
     * @param {string} name The name of the ingredient.
     *
     * @returns {HTMLElement} The node created to display the ingredient.
     */
    show(name) {
        const template = document.getElementById("ingredient-template");

        const clone = template.cloneNode(true);
        clone.removeAttribute("id");
        clone.firstElementChild.textContent = name;
        clone
            .querySelector(".btn-close")
            .addEventListener("click", () => this.delete(clone));

        return template.parentElement.appendChild(clone);
    }

    /**
     * Create a bootstrap.Tooltip for the ingredient element.
     *
     * @param {HTMLElement} node The ingredient for which to add a tooltip.
     * @param {string} image The file name of the ingredient's image.
     */
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

    /**
     * Delete an ingredient.
     *
     * Remove the ingredient from the DOM and remove it from the set of ingredients.
     *
     * @param {HTMLElement} element The element for the ingredient to delete.
     */
    delete(element) {
        bootstrap.Tooltip.getInstance(element).dispose();
        this.ingredients.delete(element.firstElementChild.textContent);
        element.remove();
    }

    /**
     * Delete all ingredients.
     *
     * @see delete
     */
    deleteAll() {
        const ingredients = document.querySelectorAll(
            ".ingredient:not(#ingredient-template)"
        );

        for (const ingredient of ingredients) {
            this.delete(ingredient);
        }
    }
}