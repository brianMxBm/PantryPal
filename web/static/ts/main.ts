import {Client} from "./api";
import {IngredientForm, SelectedIngredients} from "./models/ingredients";
import {IngredientFormController} from "./controllers/ingredients";
import {IngredientFormView} from "./views/ingredients";

const client = new Client();

const formModel = new IngredientForm(client);
const selectionsModel = new SelectedIngredients();

const formController = new IngredientFormController(formModel, selectionsModel);

const form = document.querySelector("#form-ingredients");
if (form === null) {
    throw new TypeError("Cannot find the ingredients form.");
}
const formView = new IngredientFormView(
    form as HTMLFormElement,
    formController
);

formModel.register(formView);