sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/btc/planfiiliverimlilik/controller/BaseController"
],
    function (Controller,
	BaseController) {
        "use strict";

        return BaseController.extend("com.btc.planfiiliverimlilik.controller.Main", {
            onInit: function () {
                this.getOwnerComponent().getRouter().getRoute("RouteMain").attachPatternMatched(this._onRouteMatched, this);
            },

            _onRouteMatched: function () {
                this._jsonModel = this.getOwnerComponent().getModel("jsonModel");
                this._oDataModel = this.getOwnerComponent().getModel();
                this._getPyp();
            },

            onFilterBarSearch: function (oEvent) {
                this._getData(this._getFilter());
            }
        });
    });
