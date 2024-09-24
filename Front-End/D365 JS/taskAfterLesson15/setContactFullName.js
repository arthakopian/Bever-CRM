function setContactFullName(executionContext) {
  const formContext = executionContext.getFormContext()

  let firstName = formContext.getAttribute('cre75_slot_first_name').getValue()
  let lastName = formContext.getAttribute('cre75_slot_last_name').getValue()

  if (firstName && lastName) formContext.getAttribute('cre75_name').setValue(`${firstName} ${lastName}`)
}