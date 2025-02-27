sap.ui.define([
    "sap/ui/base/ManagedObject",
    "sap/ui/core/mvc/Controller",
    "com/btc/planfiiliverimlilik/model/models",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
], function (
    ManagedObject,
    Controller,
    models,
    Filter,
    FilterOperator,
    exportLibrary, Spreadsheet
) {
    "use strict";
    var EdmType = exportLibrary.EdmType;

    return Controller.extend("com.btc.planfiiliverimlilik.controller.BaseController", {
        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        _callFunction: async function (
            sEntity,
            sMethod,
            oDataModel,
            oURLParameters
        ) {
            return new Promise((fnResolve, fnReject) => {
                sap.ui.core.BusyIndicator.show();
                const mParameters = {
                    method: sMethod,
                    urlParameters: oURLParameters,
                    success: fnResolve,
                    error: fnReject,
                };
                oDataModel.callFunction(sEntity, mParameters);
            });
        },

        _readMultiData: async function (entitySet, filters, oDataModel) {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show();
                const options = {
                    filters: filters,
                    success: resolve,
                    error: reject,
                };
                oDataModel.read(entitySet, options);
            });
        },

        _readData: async function (sPath, oDataModel) {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show();
                const options = {
                    success: resolve,
                    error: reject,
                };
                oDataModel.read(sPath, options);
            });
        },

        _createData: async function (sEntitySet, oEntry, oDataModel) {
            sap.ui.core.BusyIndicator.show(0);
            return new Promise(function (resolve, reject) {
                const options = {
                    success: resolve,
                    error: reject
                };
                oDataModel.create(sEntitySet, oEntry, options);
            });
        },

        _getPyp: function () {
            let that = this,
                aFilters = [
                    new Filter("LvPypMi", FilterOperator.EQ, "P")
                ];

            this._readMultiData("/PypSHSet", aFilters, this._oDataModel).then((oData) => {
                that._jsonModel.setProperty("/PypSH", oData.results);
            }).finally(() => {
                sap.ui.core.BusyIndicator.hide();
            });
        },

        _getFilter: function () {
            let aFilters = [];
            this.getView().byId("idPypMultiInput").getTokens().forEach(function (oItem) {
                aFilters.push(new Filter("Rproj", FilterOperator.EQ, oItem.getText()));
            });
            return aFilters;
        },

        _getData: function (aFilter) {
            let that = this;
            this._readMultiData("/GetDataSet", aFilter, this._oDataModel).then((oData) => {
                oData.results.length !== 0 ? that._jsonModel.setProperty("/Table", oData.results) : that._jsonModel.setProperty("/Table", [])
            }).finally(() => {
                sap.ui.core.BusyIndicator.hide();
            });
        },

        _exportExcell: function (oEvent) {
            const oTable = oEvent.getSource().getParent().getParent();
            const data = oTable.getBinding("rows");
            const aColumnss = this._createColumnConfig();
            const oSettings = {
                dataSource: data,
                fileName: 'Plan-Fiili_Verimlilik_Raporu.xlsx',
                workbook: {
                    columns: aColumnss
                },
            };
            const oSheet = new Spreadsheet(oSettings).build().finally(() => {
                return;
            });
        },

        _prepareValueHelpDialog: function (oEvent, fragmentName) {
            this._valueHelpInput = oEvent.getSource();
            if (!this._valueHelpDialog) {
                this._valueHelpDialog = sap.ui.xmlfragment(this.getView().getId(), "com.btc.planfiiliverimlilik.view.fragments.valueHelp." + fragmentName, this);
                this.getView().addDependent(this._valueHelpDialog);
            }
            this._valueHelpDialog.open();
            this._afterFocus(this._valueHelpDialog);
        },

        _afterFocus: function (valueHelp) {
            setTimeout(function () {
                var oSearchField = valueHelp._oSearchField;
                if (oSearchField) {
                    oSearchField.focus();
                }
            }, 500);
        },

        onSelectDialogSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter([
                new Filter("Posid", FilterOperator.Contains, sValue),
                new Filter("Post1", FilterOperator.Contains, sValue)
            ], false);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },

        onSelectDialogConfirm: function (oEvent) {
            var sDescription,
                sTitle,
                sType,
                that = this,
                oSelectedItem = oEvent.getParameter("selectedItem"),
                oSelectedItems = oEvent.getParameter("selectedItems"),
                sInputId = this._valueHelpInput.getId();
            if (!oSelectedItem) {
                return;
            }

            this._valueHelpInput.destroyTokens();

            oSelectedItems.forEach(function (oItem) {
                that._valueHelpInput.addToken(new sap.m.Token({
                    text: oItem.getTitle()
                }));
            });
            oEvent.getSource().getBinding("items").filter([]);
            this._getData(this._getFilter())
        },

        onSelectDialogCancel: function (oEvent) {
            oEvent.getSource()._dialog.close();
        },

        _createColumnConfig: function () {
            return [{
                label: "Proje",
                property: "Rproj",
                type: sap.ui.export.EdmType.String
            }, {
                label: "Modül",
                property: "ModulId",
                type: sap.ui.export.EdmType.String
            }, {
                label: "Sözleşme Planlanan Saat",
                property: "PlanSozlesme",
                type: sap.ui.export.EdmType.String
            }, {
                label: "Planlanan Ek CR Saat",
                property: "PlanEkcr",
                type: sap.ui.export.EdmType.String
            }, {
                label: "Planlanan Toplam Saat",
                property: "PlanToplam",
                type: sap.ui.export.EdmType.String
            }, {
                label: "Fiili 01 Saat",
                property: "Fiili01",
                type: sap.ui.export.EdmType.String
            }, {
                label: "Kalan Saat",
                property: "Kalan",
                type: sap.ui.export.EdmType.String
            }, {
                label: "Fiili 01 Onaylanmamış Saat",
                property: "Fiili01Onaysiz",
                type: sap.ui.export.EdmType.String
            }, {
                label: "Modül/Proje Oran",
                property: "ModulProjeOran",
                type: sap.ui.export.EdmType.String
            }, {
                label: "Fiili 01 Oran",
                property: "FiiliOran01",
                type: sap.ui.export.EdmType.String
            }, {
                label: "Fiili 02",
                property: "Fiili02",
                type: sap.ui.export.EdmType.String
            }, {
                label: "Fiili 03",
                property: "Fiili03",
                type: sap.ui.export.EdmType.String
            }, {
                label: "Fiili 04",
                property: "Fiili04",
                type: sap.ui.export.EdmType.String
            }, {
                label: "Fiili Toplam",
                property: "FiiliToplam",
                type: sap.ui.export.EdmType.String
            }, {
                label: "Modül Verimlilik",
                property: "ModulVerimlilik",
                type: sap.ui.export.EdmType.String
            }, {
                label: "Sözleşme Planlanan Gün",
                property: "PlanSozlesmeGun",
                type: sap.ui.export.EdmType.String
            }, {
                label: "Planlanan Ek CR Gün",
                property: "PlanEkcrGun",
                type: sap.ui.export.EdmType.String
            }, {
                label: "Planlanan Toplam Gün",
                property: "PlanToplamGun",
                type: sap.ui.export.EdmType.String
            }, {
                label: "Fiili 01 Gün",
                property: "Fiili01Gun",
                type: sap.ui.export.EdmType.String
            }, {
                label: "Kalan Gün",
                property: "KalanGun",
                type: sap.ui.export.EdmType.String
            }];
        }
    });
});