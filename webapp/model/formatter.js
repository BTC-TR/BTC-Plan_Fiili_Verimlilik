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
            if (isFloat[1] === "000") {
                return parseInt(sValue);
            } else {
                return parseFloat(sValue).toFixed(2);
            }
        },
    }
});