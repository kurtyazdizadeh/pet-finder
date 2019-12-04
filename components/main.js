var CLIENT_ID = "sVE4FPH6lHbBjl1IzqV9uH5HPEzz67qNUWrbfvnnMdKUHXPmKg";
var CLIENT_SECRET = "GFoFWvxSMKNxtmxsaw3S73QEjIAWDm73jYfZQyIq";

var body = {
  grant_type: "client_credentials",
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET
};

var list = new List(body, {
  inputs: {
    type: "#typeInput",
    breed: "#breedInput",
    size: "#sizeInput",
    age: "#ageInput",
    zip: "#zipInput"
  },
  petList: {
    list: ".pet-list"
  },
  buttons: {
    search: ".btn-search",
    previous: ".btn-previous",
    next: ".btn-next",
    text: "btn-send"
  },
  labels: {
    results: "#resultsLabel",
    pageNumber: "#pageNumberLabel",
    totalPages: "#totalPagesLabel"
  }
});

list.authenticate(body);
list.addEventListeners();
list.getTypesFromServer();
