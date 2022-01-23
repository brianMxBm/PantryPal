import {BaseObservable} from "../observe";
import {KeyError} from "../errors";
import {Alert, ErrorAlert, WarningAlert} from "../alerts";
import {Client} from "../api";
import {AutocompleteIngredient} from "./spoonacular";

export class SelectionsDiff {
    public readonly added: AutocompleteIngredient[];
    public readonly deleted: AutocompleteIngredient[];
    public readonly alerts: Alert[];

    constructor(diff: {
        added?: AutocompleteIngredient[];
        deleted?: AutocompleteIngredient[];
        alerts?: Alert[];
    }) {
        this.added = diff.added ?? [];
        this.deleted = diff.deleted ?? [];
        this.alerts = diff.alerts ?? [];
    }
}

export class SelectedIngredients extends BaseObservable<SelectionsDiff> {
    public lastSelection?: AutocompleteIngredient = undefined;
    private _ingredients: Map<string, AutocompleteIngredient>;

    constructor() {
        super();
        this._ingredients = new Map();
    }

    get ingredients(): IterableIterator<AutocompleteIngredient> {
        return this._ingredients.values();
    }

    add(ingredient: AutocompleteIngredient): void {
        if (this._ingredients.has(ingredient.name)) {
            const alert = new WarningAlert(
                `Ingredient '${ingredient.name}' was already selected.`
            );
            this.notify(new SelectionsDiff({alerts: [alert]}));
        } else {
            this._ingredients.set(ingredient.name, ingredient);
            this.notify(new SelectionsDiff({added: [ingredient]}));
        }
    }

    delete(name: string): void {
        const ingredient = this._ingredients.get(name);
        if (ingredient === undefined) {
            throw new KeyError(`Ingredient ${name} does not exist.`);
        }

        this._ingredients.delete(name);
        this.notify(new SelectionsDiff({deleted: [ingredient]}));
    }

    addSelection(input: string): void {
        if (this.lastSelection === undefined) {
            throw new TypeError(
                "Cannot add last selection: nothing has been selected yet."
            );
        }

        if (input !== this.lastSelection.name) {
            const alert = new ErrorAlert(
                "A selection must be made from autocompletion."
            );
            this.notify(new SelectionsDiff({alerts: [alert]}));
        } else {
            this.add(this.lastSelection);
        }
    }

    clear(): void {
        this.notify(
            new SelectionsDiff({
                deleted: Array.from(this._ingredients.values()),
            })
        );
        this._ingredients.clear();
    }
}

export class IngredientForm extends BaseObservable<AutocompleteIngredient[]> {
    private readonly _api: Client;
    private _data: AutocompleteIngredient[] = [];

    constructor(apiClient: Client) {
        super();
        this._api = apiClient;
    }

    get data() {
        return this._data;
    }

    set data(value: AutocompleteIngredient[]) {
        this._data = value;
        this.notify(this._data);
    }

    public async update(query: string): Promise<void> {
        const params = {
            query: query,
            number: 100,
        };

        const response = await this._api.get("ingredients", params);
        this.data = await response.json();
    }
}