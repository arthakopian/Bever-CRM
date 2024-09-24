async function autofillInventoryFieldOnWOP(executionContext) {
  const formContext = executionContext.getFormContext()
  const inventoryId = formContext.getAttribute('cre75_fk_inventory').getValue()?.[0].id.slice(1, -1)
  const productId = formContext.getAttribute('cre75_fk_product').getValue()?.[0].id.slice(1, -1)

  if (!inventoryId) {
    const fetchXml = `   <fetch distinct="false" mapping="logical" output-format="xml-platform" version="1.0" aggregate="true">
    <entity name="cre75_inventory_product">
      <attribute name="cre75_int_quantity" alias="cre75_int_quantity_max" aggregate="max" />
      <attribute name="cre75_fk_inventory"/>
      <filter type="and">
        <condition attribute="cre75_fk_product" value="${productId}" uitype="cre75_product" uiname="Brake Calipers" operator="eq" />
      </filter>
    </entity>
  </fetch>`

    const result = await Xrm.WebApi.retrieveMultipleRecords("cre75_inventory_product", `?fetchXml=${encodeURIComponent(fetchXml)}`);
    console.log(result);

  }

}

