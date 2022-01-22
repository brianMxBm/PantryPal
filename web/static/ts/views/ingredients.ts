import {IObserver} from "../observe";
import {Autocomplete, Options, Selection} from "../libs/autocomplete";
import {
    IngredientFormController,
    SelectedIngredientsController,
} from "../controllers/ingredients";
import {SelectionsDiff, UserIngredient} from "../models/ingredients";
import {Tooltip} from "bootstrap";

export class IngredientFormView implements IObserver<UserIngredient[]> {
    private readonly _controller: IngredientFormController;
    private readonly _autocomplete: Autocomplete;
    private readonly _acOptions: Options;
    private readonly _input: HTMLInputElement;

    constructor(form: HTMLFormElement, controller: IngredientFormController) {
        this._controller = controller;

        const input = form.querySelector("input[type='search']");
        if (input === null) {
            throw new TypeError(
                "Cannot find a search input element in the form."
            );
        } else {
            this._input = input as HTMLInputElement;
        }

        this._acOptions = {
            label: "name",
            value: "image",
            threshold: 3,
            onInput: this._onInput.bind(this),
            onSelectItem: this._onSelectItem.bind(this),
        };
        this._autocomplete = new Autocomplete(this._input, this._acOptions);

        form.addEventListener("submit", this._onSubmit.bind(this));
    }

    public update(message: UserIngredient[]): void {
        this._autocomplete.data = message;
    }

    private _onSubmit(event: Event) {
        this._controller.onSubmit(event, this._input.value);
        this._input.value = "";
    }

    private _onInput(value: string) {
        const count = this._autocomplete.createItems();
        this._controller.onInput(
            value,
            count,
            this._autocomplete.options.maximumItems,
            this._autocomplete.options.threshold
        );
    }

    private _onSelectItem(item: Selection) {
        this._controller.onSelectItem(item);
        this._input.focus();
    }
}

export class SelectedIngredientsView implements IObserver<SelectionsDiff> {
    private readonly _controller: SelectedIngredientsController;
    private readonly _elements: Map<string, Element> = new Map();

    private readonly _tooltipOptions = {
        html: true,
        template: `
            <div class="tooltip ingredient-tooltip" role="tooltip">
                <div class="tooltip-arrow"></div>
                <div class="tooltip-inner border bg-light"></div>
            </div>`,
    };

    constructor(
        form: HTMLFormElement,
        controller: SelectedIngredientsController
    ) {
        this._controller = controller;

        form.addEventListener("reset", controller.onReset.bind(controller));
    }

    public update(diff: SelectionsDiff): void {
        for (const ingredient of diff.deleted) {
            this._delete(ingredient);
        }

        for (const ingredient of diff.added) {
            this._add(ingredient);
        }
    }

    private _add(ingredient: UserIngredient) {
        const element = this._createElement(ingredient.name);
        this._addTooltip(element, ingredient.image || "no.png");
        this._elements.set(ingredient.name, element);
    }

    private _delete(ingredient: UserIngredient) {
        const element = this._elements.get(ingredient.name);
        if (element === undefined) {
            // Assume it has already been deleted somehow.
            return;
        }

        Tooltip.getInstance(element)?.dispose();
        element.remove();
        this._elements.delete(ingredient.name);
    }

    private _createElement(name: string) {
        const template = document.getElementById("ingredient-template");
        if (template === null) {
            throw new TypeError("Ingredient template element does not exist.");
        }

        const clone = template.cloneNode(true) as HTMLElement;

        if (clone.firstElementChild === null) {
            throw new TypeError(
                "Ingredient template element doesn't a child for the text."
            );
        } else {
            clone.firstElementChild.textContent = name;
        }

        clone.removeAttribute("id");

        const closeButton = clone.querySelector(".btn-close");
        if (closeButton === null) {
            throw new TypeError(
                "Ingredient template doesn't have a close button."
            );
        } else {
            closeButton.addEventListener("click", () =>
                this._controller.onDelete(name)
            );
        }

        if (template.parentElement === null) {
            throw new TypeError(
                "The template has no parent to which to append clones."
            );
        } else {
            return template.parentElement.appendChild(clone);
        }
    }

    private _addTooltip(element: Element, image: string) {
        // Initialise the tooltip for the new element.
        // Display the ingredient's image on hover.
        const title = `<img src="https://spoonacular.com/cdn/ingredients_100x100/${image}">`;
        const tooltip = new Tooltip(element, {
            container: element,
            title: title,
            ...this._tooltipOptions,
        });

        // Hide the tooltip when hovering over it. Therefore, in practice,
        // the tooltip will only show when hovering over the `clone` element
        // created above. This is done to avoid obstructing adjacent
        // ingredients with the tooltip.
        element.addEventListener("shown.bs.tooltip", () => {
            // @ts-expect-error
            tooltip.tip.addEventListener("pointerenter", () => tooltip.hide());
        });
    }
}