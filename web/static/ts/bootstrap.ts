import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-select/dist/css/bootstrap-select.css";
import $ from "jquery";
import "bootstrap-select";

// @ts-expect-error
$.fn.selectpicker.Constructor.DEFAULTS.dropupAuto = false;
// @ts-expect-error
$.fn.selectpicker.Constructor.DEFAULTS.style = "";
// @ts-expect-error
$.fn.selectpicker.Constructor.DEFAULTS.styleBase = "form-select";