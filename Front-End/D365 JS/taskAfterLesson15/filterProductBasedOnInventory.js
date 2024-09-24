let contactLookupPointer = null
let filteredProducts = []

async function filterProductBasedOnInventory(executionContext) {
  const formContext = executionContext.getFormContext()
  const inventoryId = formContext.getAttribute('cre75_fk_inventory').getValue()?.[0].id.slice(1, -1)
  if (!inventoryId) {
    return
  }
  filteredProducts = [];

  const fetchXml = ` <fetch distinct="false" mapping="logical" output-format="xml-platform" version="1.0">
    <entity name="cre75_inventory_product">
      <attribute name="cre75_fk_product" />
      <filter type="and">
        <condition attribute="cre75_fk_inventory" operator="eq" value="${inventoryId}" uitype="cre75_inventory" uiname="Inventory 1" />
      </filter>
      <link-entity name="cre75_product" alias="aa" link-type="inner" to="cre75_fk_product" from="cre75_productid">
        <filter type="and">
          <condition attribute="cre75_os_type" operator="eq" value="445070000" />
        </filter>
      </link-entity>
    </entity>
  </fetch>`

  const result = await Xrm.WebApi.retrieveMultipleRecords("cre75_inventory_product", `?fetchXml=${encodeURIComponent(fetchXml)}`);

  if (result.entities.length) {
    filteredProducts = result.entities.map(contact => contact['_cre75_fk_product_value'])
  }

  if (contactLookupPointer != null) {
    formContext.getControl('cre75_fk_product').removePreSearch(contactLookupPointer)
  }

  if (inventoryId) {
    let contactLookupPointer = filterFn
    formContext.getControl('cre75_fk_product').addPreSearch(contactLookupPointer)
  }
}

function filterFn(executionContext) {
  const formContext = executionContext.getFormContext()

  if (!filteredProducts.length) {
    return
  }

  let contactFilter = `<filter type='and'>
    <condition attribute='cre75_productid' operator='in'>
    ${filteredProducts.map(product => `<value>${product}</value>`).join('')}
    </condition>
  </filter>`

  formContext.getControl('cre75_fk_product').addCustomFilter(contactFilter, 'cre75_product')
}