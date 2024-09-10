async function initializePriceList(formContext) {
  const priceListId = formContext.data.entity.getId().slice(1, -1)
  const currency = formContext.getAttribute('transactioncurrencyid').getValue()[0].id.slice(1, -1)

  const fetchXml = `<fetch distinct="true" mapping="logical" output-format="xml-platform" version="1.0">
        <entity name="cre75_price_list">
          <attribute name="cre75_price_listid" />
          <filter type="and">
            <condition attribute="cre75_price_listid" value="${priceListId}" operator="eq" />
          </filter>
          <link-entity name="cre75_price_list_item" alias="aa" link-type="inner" to="cre75_price_listid" from="cre75_fk_price_list">
            <attribute name="cre75_price_list_itemid" />
          </link-entity>
        </entity>
      </fetch>`

  const result = await Xrm.WebApi.retrieveMultipleRecords("cre75_price_list", `?fetchXml=${encodeURIComponent(fetchXml)}`);
  if (result.entities.length) {
    result.entities.forEach(async el => {
      await Xrm.WebApi.deleteRecord('cre75_price_list_item', el['aa.cre75_price_list_itemid'])
    });
  }

  const fetchXml1 = `<fetch distinct="true" mapping="logical" output-format="xml-platform" version="1.0">
        <entity name="cre75_product">
          <attribute name="cre75_productid"/>
          <attribute name="cre75_name"/>
        </entity>
      </fetch>`

  const products = await Xrm.WebApi.retrieveMultipleRecords("cre75_product", `?fetchXml=${encodeURIComponent(fetchXml1)}`);

  if (products.entities.length) {
    products.entities.forEach(async el => {
      let data = {
        'cre75_name': el['cre75_name'],
        'cre75_mon_price': 1,
        'cre75_fk_product@odata.bind': '/cre75_products(' + el['cre75_productid'] + ')',
        'cre75_fk_price_list@odata.bind': '/cre75_price_lists(' + priceListId + ')',
        'transactioncurrencyid@odata.bind': '/transactioncurrencies(' + currency + ')'
      }

      let priceListItem = await Xrm.WebApi.createRecord('cre75_price_list_item', data)
    })
  }
}

async function checkProductExist(executionContext) {
  const formContext = executionContext.getFormContext()
  const inventoryId = form.getAttribute('cre75_fk_inventory').getValue()?.[0].id;
  const productId = form.getAttribute('cre75_fk_product').getValue()?.[0].id

  if (inventoryId && productId) {
    const fetchXml = `
        <fetch distinct="false" mapping="logical" output-format="xml-platform" version="1.0">
          <entity name="cre75_inventory_product">
            <attribute name="cre75_fk_product"/>
            <filter type="and">
              <condition attribute="cre75_fk_inventory" operator="eq" value="${inventoryId}" />
            </filter>
          </entity>
        </fetch>`;

    const result = await Xrm.WebApi.retrieveMultipleRecords("cre75_inventory_product", `?fetchXml=${encodeURIComponent(fetchXml)}`);

    if (result.entities.length) {
      const state = result.entities.some(el => el['_cre75_fk_product_value'] === productId.slice(1, -1).toLowerCase())

      if (state) {
        formContext.getControl('cre75_fk_product').setNotification('Product already exist in this Inventory', 1)
      } else {
        formContext.getControl('cre75_fk_product').clearNotification(1)
      }
    }
  }
}