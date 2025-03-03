sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/btc/planfiiliverimlilik/controller/BaseController",
    "com/btc/planfiiliverimlilik/model/formatter"
],
    function (Controller,
        BaseController,
        formatter) {
        "use strict";
        return BaseController.extend("com.btc.planfiiliverimlilik.controller.Main", {
            formatter: formatter,
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
            },

            onMultiInputTokenUpdate: function (oEvent) {
                oEvent.oSource.removeToken(oEvent.getParameter("removedTokens")[0])
                this._getData(this._getFilter())
            }
        });
    });
