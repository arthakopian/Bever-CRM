async function retrieveCurrency(executionContext) {
  const form = executionContext.getFormContext();
  const recordId = form.getAttribute('cre75_fk_price_list').getValue()?.[0].id;

  if (recordId) {
    try {
      const asset = await Xrm.WebApi.retrieveRecord('cre75_price_list', recordId, "?$select=_transactioncurrencyid_value");

      if (asset["_transactioncurrencyid_value"]) {
        const currencyId = asset["_transactioncurrencyid_value"];
        const currencyName = asset["_transactioncurrencyid_value@OData.Community.Display.V1.FormattedValue"];

        form.getAttribute('transactioncurrencyid').setValue([{ id: currencyId, name: currencyName, entityType: 'transactioncurrency' }]);
      }
    } catch (error) {
      console.error(error.message);
    }
  }
}

function setPriceListItemName(executionContext) {
  form = executionContext.getFormContext()
  const newValue = form.getAttribute('cre75_fk_product').getValue()?.[0].name
  form.getAttribute('cre75_name').setValue(newValue)
}

async function retrieveCurrencyFromInventory(executionContext) {
  const form = executionContext.getFormContext();
  const inventoryId = form.getAttribute('cre75_fk_inventory').getValue()?.[0].id;

  if (inventoryId) {
    try {
      const fetchXml = `
        <fetch distinct="false" mapping="logical" output-format="xml-platform" version="1.0">
          <entity name="cre75_inventory">
            <filter type="and">
              <condition attribute="cre75_inventoryid" operator="eq" value="${inventoryId}" />
            </filter>
            <link-entity name="cre75_price_list" alias="pl" link-type="inner" to="cre75_fk_price_list" from="cre75_price_listid">
              <attribute name="transactioncurrencyid" />
            </link-entity>
          </entity>
        </fetch>`;

      const result = await Xrm.WebApi.retrieveMultipleRecords("cre75_inventory", `?fetchXml=${encodeURIComponent(fetchXml)}`);

      if (result.entities.length) {
        const currencyId = result.entities[0]["pl.transactioncurrencyid"];
        const currencyName = result.entities[0]["pl.transactioncurrencyid@OData.Community.Display.V1.FormattedValue"];

        form.getAttribute('transactioncurrencyid').setValue([{ id: currencyId, name: currencyName, entityType: 'transactioncurrency' }]);
      }
    } catch (error) {
      console.error(error.message);
    }
  }
}

async function setPricePerUnitFromPriceListItems(executionContext) {
  const form = executionContext.getFormContext();
  const inventoryId = form.getAttribute('cre75_fk_inventory').getValue()?.[0].id;
  const productId = form.getAttribute('cre75_fk_product').getValue()?.[0].id;
  form.getControl('cre75_mon_price_per_unit').setDisabled(true);
  let pricePerUnit = null;

  if (inventoryId && productId) {
    try {
      const fetchXml = `
        <fetch distinct="false" mapping="logical" output-format="xml-platform" version="1.0">
          <entity name="cre75_inventory">
            <filter type="and">
              <condition attribute="cre75_inventoryid" operator="eq" value="${inventoryId}" />
            </filter>
            <attribute name="cre75_fk_price_list" />
          </entity>
        </fetch>`;

      const result = await Xrm.WebApi.retrieveMultipleRecords("cre75_inventory", `?fetchXml=${encodeURIComponent(fetchXml)}`);
      const priceList = result.entities?.[0]['_cre75_fk_price_list_value']

      if (priceList) {
        const fetchXml1 = `
        <fetch distinct="false" mapping="logical" output-format="xml-platform" version="1.0">
          <entity name="cre75_price_list_item">
          <attribute name="cre75_mon_price" />
            <filter type="and">
              <condition attribute="cre75_fk_price_list" operator="eq" value="${priceList}" />
              <condition attribute="cre75_fk_product" operator="eq" value="${productId}" />
            </filter>
          </entity>
        </fetch>`;

        const result = await Xrm.WebApi.retrieveMultipleRecords("cre75_price_list_item", `?fetchXml=${encodeURIComponent(fetchXml1)}`);
        pricePerUnit = result.entities?.[0]?.['cre75_mon_price']
      }
      if (!pricePerUnit) {
        const product = await Xrm.WebApi.retrieveRecord("cre75_product", productId, "?$select=cre75_mon_price_per_unit");
        pricePerUnit = product['cre75_mon_price_per_unit'];
      }

      if (pricePerUnit) {
        form.getAttribute('cre75_mon_price_per_unit').setValue(pricePerUnit);
      }
    } catch (error) {
      console.error("Error retrieving price:", error.message);
    }
  }
}


const fetchXml = `<fetch distinct="true" mapping="logical" output-format="xml-platform" version="1.0">
  <entity name="cre75_inventory">
    <filter type="and">
      <condition attribute="cre75_inventoryid" value="${inventoryId}"operator="eq" />
    </filter>
    <link-entity name="cre75_price_list" alias="aa" link-type="inner" to="cre75_fk_price_list" from="cre75_price_listid">
      <link-entity name="cre75_price_list_item" alias="ab" link-type="inner" to="cre75_price_listid" from="cre75_fk_price_list">
        <filter type="and">
          <condition attribute="cre75_fk_product" operator="eq" />
          <condition attribute="cre75_mon_price" value="" operator="eq" />
        </filter>
      </link-entity>
    </link-entity>
  </entity>
</fetch>`