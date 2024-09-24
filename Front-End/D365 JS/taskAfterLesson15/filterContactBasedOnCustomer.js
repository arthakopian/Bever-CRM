let contactLookupPointer = null
let filteredContacts = []

async function filterContactBasedOnCustomer(executionContext) {
  const formContext = executionContext.getFormContext()
  const customerId = formContext.getAttribute('cre75_fk_customer').getValue()?.[0].id.slice(1, -1)
  if (!customerId) {
    return
  }
  filteredContacts = [];

  const fetchXml = `<fetch distinct="true" mapping="logical" output-format="xml-platform" version="1.0">
    <entity name="cre75_my_position">
      <attribute name="cre75_fk_contact" />
      <filter type="and">
        <condition attribute="cre75_fk_account" operator="eq" value="${customerId}" />
      </filter>
    </entity>
  </fetch>`

  const result = await Xrm.WebApi.retrieveMultipleRecords("cre75_my_position", `?fetchXml=${encodeURIComponent(fetchXml)}`);

  if (result.entities.length) {
    filteredContacts = result.entities.map(contact => contact['_cre75_fk_contact_value'])
  }

  if (contactLookupPointer != null) {
    formContext.getControl('cre75_fk_contact').removePreSearch(contactLookupPointer)
  }

  if (customerId) {
    let contactLookupPointer = filterFn
    formContext.getControl('cre75_fk_contact').addPreSearch(contactLookupPointer)
  }
}

function filterFn(executionContext) {
  const formContext = executionContext.getFormContext()

  if (!filteredContacts.length) {
    return
  }

  let contactFilter = `<filter type='and'>
    <condition attribute='cre75_my_contactid' operator='in'>
    ${filteredContacts.map(contact => `<value>${contact}</value>`).join('')}
    </condition>
  </filter>`

  formContext.getControl('cre75_fk_contact').addCustomFilter(contactFilter, 'cre75_my_contact')
}