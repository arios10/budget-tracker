//db variable
let db;
//connection to IndexedDB
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
    //reference to database
    const db = event.target.result;
    //object store
    db.createObjectStore("pending", { autoIncrement: true });
  };

//on success
request.onsuccess = function (event) {
    db = event.target.result;
    //if navigator online, upload transaction
    if (navigator.online) {
      uploadTransaction();
    }
  };

//on error, error code
request.onerror = function (event) {
    console.log(event.target.errorCode);
};
//save offline transaction
function saveRecord(record) {
  //open a new transaction with the db with read and write permission
  const transaction = db.transaction(["pending"], "readwrite");

  //access the object store
  const store = transaction.objectStore("pending");

  //add record to store
  store.add(record);
}

//upload offline record
function uploadTransaction() {
    const transaction = db.transaction(["pending"], "readwrite");

    //access object store
    const store = transaction.objectStore("pending");

    // get all records from store and set to a variable
    const getAll = store.getAll();

    //on success
    getAll.onsuccess = function () {
        //if store has data
        if (getAll.result.length > 0) {
            fetch("/api/transaction", {
              method: "POST",
              body: JSON.stringify(getAll.result),
              headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json",
              },
          })
            .then((response) => response.json())
            .then(() => {
                const transaction = db.transaction(["pending"], "readwrite");
                //access object store
                const store = transaction.objectStore("pending");
                //clear all items in store
                store.clear();

                alert("All pending transactions now submitted!");
            })
            .catch((err) => {
                console.log(err);
            });
        }
    };
}

//listen for app returning online functionality
window.addEventListener("online", uploadTransaction);