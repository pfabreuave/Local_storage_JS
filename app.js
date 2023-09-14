/*
  este código crea una aplicación simple para registrar y mostrar ingresos y gastos, 
  calculando automáticamente los totales y mostrándolos en la página web. 
  Los datos se almacenan en el almacenamiento local del navegador para que persistan entre sesiones.

*/

/*
  Seleccionar elementos del DOM:

*/

const tbody = document.querySelector("tbody");  // tabla donde se mostrarán los registros de ingresos y gastos
const descItem = document.querySelector("#desc"); // Selecciona elementos HTML por su identificador (ID).
const amount = document.querySelector("#amount"); // Selecciona elementos HTML por su identificador (ID).
const type = document.querySelector("#type"); // Selecciona elementos HTML por su identificador (ID).
const btnNew = document.querySelector("#btnNew"); // botón para agregar nuevos registros.
const btnClearStorage = document.querySelector("#btnClearStorage"); // botón para eliminar todos los registros
 


const incomes = document.querySelector(".incomes"); // Selecciona elementos HTML con la clase / muestra ingresos
const expenses = document.querySelector(".expenses"); // Selecciona elementos HTML con la clase / muestra gastos
const total = document.querySelector(".total"); // Selecciona elementos HTML con la clase / muestra saldo

let items;



btnClearStorage.addEventListener("click", () => {
  // Llama a una función para eliminar los datos almacenados
  clearStorage();
});


/*
  Evento `onclick` para el botón `btnNew`:
   - Se verifica si los campos `descItem`, `amount` y `type` están vacíos y muestra una alerta si es así.
   - Si los campos están llenos, se agrega un nuevo objeto al arreglo `items` con la descripción (`desc`), 
     cantidad (`amount`) y tipo (`type`) de la transacción.
   - Luego, se llama a las funciones `setItensBD()` y `loadItens()` para guardar los cambios y actualizar 
     la lista de registros.
   - Finalmente, se borran los valores de los campos `descItem` y `amount`.

*/

btnNew.onclick = () => {
  if (descItem.value === "" || amount.value === "" || type.value === "") {
    return alert("Preencha todos os campos!");
  }

  items.push({
    desc: descItem.value,
    amount: Math.abs(amount.value).toFixed(2),
    type: type.value,
  });

  setItensBD();

  loadItens();

  descItem.value = "";
  amount.value = "";
};

/*
  manejador de eventos al botón de descarga para que, cuando el usuario haga clic, 
  se cree el archivo CSV y se ofrezca para su descarga.

*/

const downloadButton = document.querySelector('#downloadButton');

downloadButton.addEventListener('click', () => {
  const csvData = convertToCSV(items);
  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);

  // Crea un enlace para descargar el archivo
  const a = document.createElement('a');
  a.href = url;
  a.download = 'registros.csv';

  // Simula un clic en el enlace para iniciar la descarga
  a.click();

  // Libera recursos
  window.URL.revokeObjectURL(url);
});


/*
  Función `deleteItem(index)`:
   - Elimina un elemento del arreglo `items` en la posición `index`.
   - Llama a las funciones `setItensBD()` y `loadItens()` para actualizar la lista de registros 
     después de la eliminación.
*/

function deleteItem(index) {
  items.splice(index, 1);
  setItensBD();
  loadItens();
}

/*
  Función `insertItem(item, index)`:
   - Crea una nueva fila (`<tr>`) en la tabla con datos del objeto `item`.
   - La fila contiene la descripción, cantidad, un ícono que representa el tipo de transacción 
     (entrada o salida) y un botón para eliminar el registro.
   - La fila se agrega al elemento `tbody` de la tabla.

*/

function insertItem(item, index) {
  let tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${item.desc}</td>
    <td>R$ ${item.amount}</td>
    <td class="columnType">${
      item.type === "Entrada"
        ? '<i class="bx bxs-chevron-up-circle"></i>'
        : '<i class="bx bxs-chevron-down-circle"></i>'
    }</td>
    <td class="columnAction">
      <button onclick="deleteItem(${index})"><i class='bx bx-trash'></i></button>
    </td>
  `;

  tbody.appendChild(tr);
}

/*
  Función `loadItens()`:
   - Obtiene los registros de ingresos y gastos llamando a la función `getItensBD()`.
   - Limpia el contenido del elemento `tbody`.
   - Luego, para cada registro, llama a `insertItem(item, index)` para agregarlo a la tabla.
   - Finalmente, llama a `getTotals()` para actualizar los totales.

*/

function loadItens() {
  items = getItensBD();
  tbody.innerHTML = "";
  items.forEach((item, index) => {
    insertItem(item, index);
  });

  getTotals();
}

/*
  Función `getTotals()`:
   - Calcula los totales de ingresos y gastos sumando las cantidades correspondientes en el arreglo `items`.
   - Actualiza los elementos HTML con las clases `incomes`, `expenses` y `total` con los totales calculados.

*/

function getTotals() {
  const amountIncomes = items
    .filter((item) => item.type === "Entrada")
    .map((transaction) => Number(transaction.amount));

  const amountExpenses = items
    .filter((item) => item.type === "Saida")
    .map((transaction) => Number(transaction.amount));

  const totalIncomes = amountIncomes
    .reduce((acc, cur) => acc + cur, 0)
    .toFixed(2);

  const totalExpenses = Math.abs(
    amountExpenses.reduce((acc, cur) => acc + cur, 0)
  ).toFixed(2);

  const totalItems = (totalIncomes - totalExpenses).toFixed(2);

  incomes.innerHTML = totalIncomes;
  expenses.innerHTML = totalExpenses;
  total.innerHTML = totalItems;
}

/*
  Declaración de funciones para interactuar con el almacenamiento local (localStorage):
   - `getItensBD()`: Obtiene los datos de registros guardados en el almacenamiento local y los 
      devuelve como un arreglo. Si no hay datos, devuelve un arreglo vacío.
   - `setItensBD()`: Guarda los registros actuales en el almacenamiento local como un objeto JSON.

*/

const getItensBD = () => JSON.parse(localStorage.getItem("db_items")) ?? [];
const setItensBD = () =>
  localStorage.setItem("db_items", JSON.stringify(items));

/*
  Esta función primero muestra un cuadro de confirmación para asegurarse de que el usuario 
  realmente quiere eliminar todos los registros. Si el usuario confirma, borra los datos 
  almacenados en localStorage, limpia la tabla en la página, actualiza los totales a cero, 
  y limpia los campos de entrada y el arreglo items.

*/

  function clearStorage() {
    if (confirm("¿Estás seguro de que deseas eliminar todos los registros, no quiero lloradera?")) {
      // Borra los datos almacenados en localStorage
      localStorage.removeItem("db_items");
      
      // Limpia la tabla en la página
      tbody.innerHTML = "";
  
      // Actualiza los totales para reflejar que no hay registros
      incomes.innerHTML = "0.00";
      expenses.innerHTML = "0.00";
      total.innerHTML = "0.00";
  
      // Limpia los campos de entrada
      descItem.value = "";
      amount.value = "";
      type.value = "";
  
      // Limpia el arreglo de registros
      items = [];
    }
  }


  /*
    Esta función toma el arreglo de registros items y lo convierte en un formato CSV. 
    Cada registro se convierte en una fila en el archivo CSV, y los encabezados se agregan 
    al principio del archivo. genera el archivo CSV que luego los usuarios pueden descargar 
    y compartir manualmente.

  */

  function convertToCSV(items) {
    const csvRows = [];
    
    // Encabezados CSV
    csvRows.push(['Descripción', 'Cantidad', 'Tipo']);
  
    // Convertir registros en filas CSV
    for (const item of items) {
      const row = [item.desc, item.amount, item.type];
      csvRows.push(row);
    }
  
    // Combinar filas en un solo string CSV
    const csvData = csvRows.map(row => row.join(',')).join('\n');
  
    return csvData;
  }
  

/*
  Llama a `loadItens()` al final para cargar inicialmente los registros y los totales cuando se carga la página.

*/

loadItens();