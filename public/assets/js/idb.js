// create variable to hold db connection
let db;
// establish a connection to IndexedDB database called 'pizza_hunt' and set it to version 1
const request = indexedDB.open("pizza_hunt", 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function (event) {
  // save a reference to the database
  const db = event.target.result;
  // create an object store (table) called 'new_pizza', set it to have an auto incrementing primary key of sorts
  db.createObjectStore("new_pizza", { autoIncrement: true });
};

// upon a successful
request.onsuccess = function (event) {
  // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
  db = event.target.result;

  // check if app is online, if yes run uploadPizza() function to send all local db data to api
  if (navigator.onLine) {
    // we haven't created this yet, but we will soon, so let's comment it out for now
    uploadPizza();
  }
};

request.onerror = function (event) {
  // log error here
  console.log(event.target.errorCode);
};

//   With IndexedDB, we don't always have that direct connection like we do with SQL and MongoDB databases,
// so methods for performing CRUD operations with IndexedDB aren't available at all times. Instead, we have
// to explicitly open a transaction, or a temporary connection to the database. This will help the
// IndexedDB database maintain an accurate reading of the data it stores so that data isn't in flux
// all the time.
// Once we open that transaction, we directly access the new_pizza object store, because this is where
// we'll be adding data. Finally, we use the object store's .add() method to insert data into the
// new_pizza object store.
// This saveRecord() function will be used in the add-pizza.js file's form submission function if the
// fetch() function's .catch() method is executed

// This function will be executed if we attempt to submit a new pizza and there's no internet connection
function saveRecord(record) {
  // open a new transaction with the datbase with read and write permissions
  const transaction = db.transaction(["new_pizza"], "readwrite");

  // access the object store for 'new_pizza'
  const pizzaObjectStore = transaction.objectStore("new_pizza");

  // add record to your store with add method
  pizzaObjectStore.add(record);
}

// // Remember, the fetch() function's .catch() method is only executed on network failure! \\ \\

function uploadPizza() {
  // open a transaction on your db
  const transaction = db.transaction(["new_pizza"], "rewrite");

  // access your object store
  const pizzaObjectStore = transaction.objectStore("new_pizza");

  // get all records from store and set to  a variable
  const getAll = pizzaObjectStore.getAll();

  // upon a successful .getAll() execution, run this function
  getAll.onsuccess = function () {
    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 0) {
      fetch("/api/pizzas", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // open one more transaction
          const transaction = db.transaction(["new_pizza"], "readwrite");
          // access the new_pizza object store
          const pizzaObjectStore = transaction.objectStore("new_pizza");
          // clear all items in your store
          pizzaObjectStore.clear();

          alert("All saved pizza has been submitted!");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

// Now the getAll.onsuccess event will execute after the .getAll() method completes successfully. 
// At that point, the getAll variable we created above it will have a .result property that's an 
// array of all the data we retrieved from the new_pizza object store.
// If there's data to send, we send that array of data we just retrieved to the server at the 
// POST /api/pizzas endpoint. Fortunately, the Mongoose .create() method we use to create a pizza 
// can handle either single objects or an array of objects, so no need to create another route and controller method to handle this one event.
// On a successful server interaction, we'll access the object store one more time and empty it, 
// as all of the data that was there is now in the database.


}




// listen for app coming back online
window.addEventListener('online', uploadPizza);
