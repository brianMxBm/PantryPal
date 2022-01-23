import {Recipes} from "../models/recipes";
import {SelectedIngredients} from "../models/ingredients";

export class RecipesController {
    private _recipes: Recipes;
    private _ingredients: SelectedIngredients;

    constructor(recipesModel: Recipes, ingredientsModel: SelectedIngredients) {
        this._recipes = recipesModel;
        this._ingredients = ingredientsModel;
    }

    public async onSearch(
        sort: string,
        cuisines: string[],
        type: string,
        maxReadyTime: string
    ): Promise<void> {
        const ingred = Array.from(this._ingredients.ingredients).join(",");
        const cuisine = cuisines.join(",");
        await this._recipes.update(ingred, sort, cuisine, type, maxReadyTime);
    }
}