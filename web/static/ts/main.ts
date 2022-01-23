import {Client} from "./api";
import {IngredientForm, SelectedIngredients} from "./models/ingredients";
import {
    IngredientFormController,
    SelectedIngredientsController,
} from "./controllers/ingredients";
import {IngredientFormView, SelectedIngredientsView} from "./views/ingredients";
import {Recipes} from "./models/recipes";
import {RecipesController} from "./controllers/recipes";
import {RecipesView} from "./views/recipes";
import "./bootstrap";
import "../style.css";

const client = new Client();

const formModel = new IngredientForm(client);
const selectionsModel = new SelectedIngredients();
const recipesModel = new Recipes(client);

const formController = new IngredientFormController(formModel, selectionsModel);
const selectionsController = new SelectedIngredientsController(selectionsModel);
const recipesController = new RecipesController(recipesModel, selectionsModel);

const form = document.querySelector("#form-ingredients");
if (form === null) {
    throw new TypeError("Cannot find the ingredients form.");
}

const formView = new IngredientFormView(
    form as HTMLFormElement,
    formController
);
formModel.register(formView);

const selectionsView = new SelectedIngredientsView(
    form as HTMLFormElement,
    selectionsController
);
selectionsModel.register(selectionsView);

const searchButton = document.querySelector("#button-search");
if (searchButton === null) {
    throw new TypeError("Cannot find the search button.");
}

const missingToggle = document.querySelector("#check-recipe-hide");
if (missingToggle === null) {
    throw new TypeError("Cannot find the missing recipes toggle switch.");
}

const recipesView = new RecipesView(
    searchButton,
    missingToggle,
    recipesController
);
recipesModel.register(recipesView);