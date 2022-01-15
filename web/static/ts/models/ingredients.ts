import {BaseObservable} from "../observe.js";
import {KeyError} from "../errors.js";

export interface UserIngredient {
    readonly name: string;
    readonly image: string;
}

export class UserIngredientDiff {
    public readonly ingredient: UserIngredient;
    public readonly deleted: boolean;

    constructor(ingredient: UserIngredient, deleted: boolean = false) {
        this.ingredient = ingredient;
        this.deleted = deleted;
    }
}

export class UserIngredients extends BaseObservable<UserIngredientDiff> {
    private _ingredients: Map<string, UserIngredient>;

    constructor() {
        super();
        this._ingredients = new Map();
    }

    get ingredients(): IterableIterator<UserIngredient> {
        return this._ingredients.values();
    }

    add(ingredient: UserIngredient): void {
        this._ingredients.set(ingredient.name, ingredient);
        this.notify(new UserIngredientDiff(ingredient));
    }

    delete(name: string): void {
        const ingredient = this._ingredients.get(name);
        if (ingredient === undefined) {
            throw new KeyError(`Ingredient ${name} does not exist.`);
        }

        this._ingredients.delete(name);
        this.notify(new UserIngredientDiff(ingredient, true));
    }

    notify(diff: UserIngredientDiff): void {
        for (const observer of this._observers) {
            observer.update(diff);
        }
    }
}