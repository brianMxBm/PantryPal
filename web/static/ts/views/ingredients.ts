import {IObserver} from "../observe.js";
import {Autocomplete, Options, Selection} from "../libs/autocomplete.js";
import {IngredientFormController} from "../controllers/ingredients.js";
import {UserIngredient} from "../models/ingredients.js";

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

        form.addEventListener(
            "submit",
            this._controller.onSubmit.bind(this._controller)
        );
    }

    public update(message: UserIngredient[]): void {
        this._autocomplete.data = message;
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