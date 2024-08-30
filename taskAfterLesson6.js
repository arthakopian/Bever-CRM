function setName(executionContext) {
  form = executionContext.getFormContext()

  const newValue = form.getAttribute('cre75_fk_product').getValue()?.[0].name

  form.getAttribute('cre75_name').setValue(newValue)
}

function toggleProductUnitPrice(executionContext) {
  form = executionContext.getFormContext()
  const option = form.getAttribute('cre75_os_type').getSelectedOption().text
  const toggleUnit = form.getControl('cre75_mon_price_per_unit')

  option === 'Product' ? toggleUnit.setVisible(true) : toggleUnit.setVisible(false)
}

function setTotalAmount(executionContext) {
  form = executionContext.getFormContext()
  const quantity = form.getAttribute('cre75_int_quantity').getValue()
  const price = form.getAttribute('cre75_mon_price_per_unit').getValue()
  let total = quantity * price
  form.getAttribute('cre75_mon_total_amount').setValue(total)
}

function toggleInvetoryProductFields(executionContext) {
  const attributes = ['cre75_fk_inventory', 'cre75_fk_product', 'cre75_int_quantity', 'cre75_mon_price_per_unit']
  form = executionContext.getFormContext()
  const type = form.ui.getFormType()
  if (type == 2) {
    attributes.forEach(atr => form.getControl(atr).setDisabled(true))
  } else if (type == 1) {
    attributes.forEach(atr => form.getControl(atr).setDisabled(false))
  }
}