//Test
window.onload = async () => {

  const fetchXml = `<fetch distinct="false" mapping="logical" output-format="xml-platform" version="1.0">
      <entity name="cre75_product">
        <attribute name="cre75_productid" />
        <attribute name="cre75_name" />
      </entity>
    </fetch>`

  const products = await parent.Xrm.WebApi.retrieveMultipleRecords("cre75_product", `?fetchXml=${encodeURIComponent(fetchXml)}`);

  const productsSelect = document.getElementById('product')
  for (let i = 0; i < products.entities.length; i++) {
    const product = products.entities[i];
    productsSelect.options[productsSelect.options.length] = new Option(product['cre75_name'], product['cre75_productid'])
  }
  const inventoryId = getParameterValue('inventoryId')

  const cancelButton = document.getElementById('cancel-btn');
  cancelButton.onclick = () => {
    productsSelect.value = "";
    document.getElementById('operation').value = "";
    document.getElementById('quantity').value = "";
    alert("Cancel clicked, form reset");
  };

  const okButton = document.getElementById('ok-btn');
  okButton.onclick = async () => {
    const selectedProduct = productsSelect.value;
    const selectedOperation = document.getElementById('operation').value;
    const quantity = +document.getElementById('quantity').value;

    const fetchXml1 = `  <fetch distinct="false" mapping="logical" output-format="xml-platform" version="1.0">
            <entity name="cre75_inventory_product">
              <attribute name="cre75_int_quantity" />
              <filter type="and">
                <condition attribute="cre75_fk_inventory" operator="eq" value="${inventoryId}"/>
                <condition attribute="cre75_fk_product" operator="eq" value="${selectedProduct}"/>
              </filter>
            </entity>
          </fetch>`

    const inventoryProducts = await parent.Xrm.WebApi.retrieveMultipleRecords("cre75_inventory_product", `?fetchXml=${encodeURIComponent(fetchXml1)}`);

    if (selectedProduct && selectedOperation && quantity) {
      if (selectedOperation === 'in') {
        //Operation type equal In
        if (inventoryProducts.entities.length) {
          let target = inventoryProducts.entities[0]
          let tagetQuantity = inventoryProducts.entities[0]['cre75_int_quantity']
          let data = {
            'cre75_int_quantity': quantity + tagetQuantity,
          }

          let updatedInventoryProduct = await parent.Xrm.WebApi.updateRecord('cre75_inventory_product', target['cre75_inventory_productid'], data)
          showVanishableMessage({ type: 'success', message: 'Product quantity is successfully updated' })
        } else {
          let data = {
            'cre75_fk_inventory@odata.bind': '/cre75_inventories(' + inventoryId.slice(1, -1) + ')',
            'cre75_fk_product@odata.bind': '/cre75_products(' + selectedProduct + ')',
            'cre75_int_quantity': quantity,
          }

          let newInventoryProduct = await parent.Xrm.WebApi.createRecord('cre75_inventory_product', data)
          showVanishableMessage({ type: 'success', message: 'Product is successfully created' })
        }
      } else {
        //Operation type equal Out
        if (inventoryProducts.entities.length) {
          let target = inventoryProducts.entities[0]
          let tagetQuantity = inventoryProducts.entities[0]['cre75_int_quantity']
          if (quantity > tagetQuantity) {
            showVanishableMessage({ type: 'error', message: 'There are not enough product quantity' })
          } else {
            let data = {
              'cre75_int_quantity': tagetQuantity - quantity,
            }

            let updatedInventoryProduct = await parent.Xrm.WebApi.updateRecord('cre75_inventory_product', target['cre75_inventory_productid'], data)
            showVanishableMessage({ type: 'success', message: 'Product quantity is updated' })
          }
        } else {
          showVanishableMessage({ type: 'error', message: 'There are not such product' })
        }
      }
    } else {
      alert("Please fill out all fields.");
    }
  };

}

function getParameterValue(parameterName) {
  if (location.search != null) {
    if (location.search.split("=")[1] != null) {
      return JSON.parse(decodeURIComponent(location.search.split("=")[1]))[parameterName];
    }
  }
}

function showVanishableMessage({ type, message }, duration = 3000) {
  const messageElement = document.createElement('div');
  messageElement.textContent = type === 'error' ? '✖ ' + message : '✔ ' + message;

  messageElement.style.padding = '10px';
  messageElement.style.backgroundColor = type === 'error' ? 'red' : '#28a745';
  messageElement.style.color = 'white';
  messageElement.style.borderRadius = '5px';
  messageElement.style.margin = '10px 0';
  messageElement.style.textAlign = 'center';
  messageElement.style.fontSize = '16px';

  const messageContainer = document.getElementById('message-container');
  messageContainer.appendChild(messageElement);

  setTimeout(() => {
    messageElement.remove();
    document.getElementById('product').value = "";
    document.getElementById('operation').value = "";
    document.getElementById('quantity').value = "";
  }, duration);
}
