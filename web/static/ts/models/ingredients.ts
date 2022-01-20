import {BaseObservable} from "../observe";
import {KeyError} from "../errors";
import {Client} from "../api";

export interface UserIngredient {
    readonly name: string;
    readonly image: string;
}

export class SelectionsDiff {
    public readonly ingredient: UserIngredient;
    public readonly deleted: boolean;

    constructor(ingredient: UserIngredient, deleted: boolean = false) {
        this.ingredient = ingredient;
        this.deleted = deleted;
    }
}

export class SelectedIngredients extends BaseObservable<SelectionsDiff> {
    public lastSelection?: UserIngredient = undefined;
    private _ingredients: Map<string, UserIngredient>;

    constructor() {
        super();
        this._ingredients = new Map();
    }

    get ingredients(): IterableIterator<UserIngredient> {
        return this._ingredients.values();
    }

    add(ingredient: UserIngredient): void {
        // TODO: check for duplicates and notify an error instead.
        this._ingredients.set(ingredient.name, ingredient);
        this.notify(new SelectionsDiff(ingredient));
    }

    delete(name: string): void {
        const ingredient = this._ingredients.get(name);
        if (ingredient === undefined) {
            throw new KeyError(`Ingredient ${name} does not exist.`);
        }

        this._ingredients.delete(name);
        this.notify(new SelectionsDiff(ingredient, true));
    }

    addSelection(): void {
        if (this.lastSelection === undefined) {
            throw new TypeError(
                "Cannot add last selection: nothing has been selected yet."
            );
        }

        this.add(this.lastSelection);
    }

    deleteLastSelection(): void {
        if (this.lastSelection === undefined) {
            throw new TypeError(
                "Cannot delete last selection: nothing has been selected yet."
            );
        }

        this.delete(this.lastSelection.name);
    }
}

export class IngredientForm extends BaseObservable<UserIngredient[]> {
    private readonly _api: Client;
    private _data: UserIngredient[] = [];

    constructor(apiClient: Client) {
        super();
        this._api = apiClient;
    }

    get data() {
        return this._data;
    }

    set data(value: UserIngredient[]) {
        this._data = value;
        this.notify(this._data);
    }

    public async update(query: string): Promise<void> {
        const params = {
            query: query,
            number: 100,
        };

        // TODO: check the returned status code.
        // TODO: check for empty input.
        const response = await this._api.get("ingredients", params);
        this.data = await response.json();
    }
}