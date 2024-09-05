function openInventoryProductPopup(formContext) {
  let inventoryId = formContext.data.entity.getId()

  let pageInput = {
    pageType: "webresource",
    webresourceName: "cre75_html_inventory_product_popup",
    data: JSON.stringify({ "inventoryId": inventoryId })
  }

  let navigationOptions = {
    target: 2,
    width: 600,
    height: 400,
    position: 1
  }

  Xrm.Navigation.navigateTo(pageInput, navigationOptions).then(
    function success() {

    },
    function error() {

    }
  );
}