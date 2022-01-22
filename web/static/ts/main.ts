import {Client} from "./api";
import {IngredientForm, SelectedIngredients} from "./models/ingredients";
import {
    IngredientFormController,
    SelectedIngredientsController,
} from "./controllers/ingredients";
import {IngredientFormView, SelectedIngredientsView} from "./views/ingredients";

const client = new Client();

const formModel = new IngredientForm(client);
const selectionsModel = new SelectedIngredients();

const formController = new IngredientFormController(formModel, selectionsModel);
const selectionsController = new SelectedIngredientsController(selectionsModel);

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