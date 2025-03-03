sap.ui.define([
    "sap/ui/base/ManagedObject",
    "com/btc/planfiiliverimlilik/controller/BaseController"
], function (
    ManagedObject,
    BaseController
) {
    "use strict";

    return {
        numberUnit: function (sValue) {
            if (!sValue) {
                return "";
            }

            var isFloat = sValue.split(".");
            if (isFloat[1] === "000" || isFloat[1] === "00") {
                return parseInt(sValue);
            } else {
                return parseFloat(sValue).toFixed(2);
            }
        },

        eksiZaman: function (sValue) {
            if (!sValue) {
                return "None"
            }
            let state = "None",
                value = sValue.includes("-");

            if (!value) {
                return state = "Success"
            } else {
                return state = "Error"
            }
        },
        eksiOran: function (sValue) {
            if (!sValue) {
                return "None"
            }
            let state = "None",
                value = parseInt(sValue);

            if (value <= 100) {
                return state = "Success"
            } else {
                return state = "Error"
            }
        }
    }
});