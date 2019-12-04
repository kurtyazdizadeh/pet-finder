var PETFINDER = {
  client_id: "lf8e5VgTKBuJs49hsjWnApgTvYJfZRUyWAqubY4KcYCbk4q22L",
  client_secret: "oPtVuP7zP4517CDLtLIbIS4tByP34NDlmCJFcUIj"
};
var TWILLIO = {
  application_sid: "AC3a927b7827ff3cc9c09c6391136be1eb",
  token: "045b3ab466976155f5220865389b2004"
};

//https://www.twilio.com/docs/sms/api/message-resource#read-multiple-message-resources
//https://www.twilio.com/docs/sms/api/message-resource#create-a-message-resource

$(document).ready(initializeApp);

var list = null;
function initializeApp() {
  var elementConfig = {
    typeInput: "#typeInput",
    breedInput: "#breedInput",
    sizeInput: "#sizeInput",
    ageInput: "#ageInput",
    zipInput: "#zipInput",
    searchButton: ".btn-search",
    petsArea: ".pet-list",
    resultsLabel: "#resultsLabel",
    pageNumberLabel: "#pageNumberLabel",
    totalPagesLabel: "#totalPagesLabel",
    previousButton: ".btn-previous",
    nextButton: ".btn-next",
    container: ".app-container",
    phonePopout: ".phone-modal",
    phoneInput: "#phoneInput",
    phoneTextButton: ".btn-send"
  };

  list = new PetList(elementConfig);
  list.authenticate();
  list.addEventListeners();

}
// notes:
// static prop: TOKEN { "token_type": "Bearer", "access_token": "..." }
//  get animal types: GET https://api.petfinder.com/v2/types
//      < { types: [{ "name": "Dog", "coats": [], "colors": [], "genders": [], "_links": {...} }] }

// get animal breeds: GET https://api.petfinder.com/v2/types/{type}/breeds
//     < { breeds: { "name": "Affenpinscher", "_links": { "type": { "href": "/v2/types/dog" } } } }

// GET https://api.petfinder.com/v2/animals
//- type
//- breed
//- location: zip code
//- size: small, medium, large, xlarge
//- age
/*
"animals": [{
"id": 45117268,
"breeds": {
"primary": "German Shepherd Dog",
},
"age": "Baby",
"size": "Large",
"name": "Beyonce von Shasta",
"description": "Beyonce von Shasta is a delightful 8 week old Shepherd MIX Beyonce von Shasta is currently in a foster home...",
"photos": [ {
"small": "https://dl5zpyw5k3jeb.cloudfront.net/photos/pets/45117268/1/?bust=1561784337&width=100",
}],
}],
"pagination": {
"count_per_page": 20,
"total_count": 4993080,
"current_page": 1,
"total_pages": 249654,
}
*/

class TextMe {
  constructor(elementConfig, callbacks) {
    this.callbacks = callbacks;
    this.processAccountsFromServer = this.processAccountsFromServer.bind(this);
    this.failedAccountsFromServer = this.failedAccountsFromServer.bind(this);
    this.handleSendClick = this.handleSendClick.bind(this);

    this.sentTextMessage = this.sentTextMessage.bind(this);
    this.failedTextMessage = this.failedTextMessage.bind(this);

    this.dom = {
      modal: $(elementConfig.modal),
      button: $(elementConfig.button),
      input: $(elementConfig.input)
    };
  }

  setUp() {
    this.doAjax({
      url: "Accounts",
      method: "POST"
    })
      .done(this.processAccountsFromServer)
      .fail(this.failedAccountsFromServer);
  }

  processAccountsFromServer(response) {
    var $response = $(response);
    console.log("The status of the twillio api is: ", $response.find("Status").text());

    this.dom.button.click(this.handleSendClick);
  }

  failedAccountsFromServer(xhr) {
    console.error("Unable to verify twillio.");
  }

  doAjax(request) {
    request.url = `https://api.twilio.com/2010-04-01/${request.url}`;
    request.headers = {
      Authorization: "Basic " + btoa(`${TWILLIO.application_sid}:${TWILLIO.token}`)
    };

    return $.ajax(request);
  }

  sendText(phoneNumber, body) {
    this.doAjax({
      url: "Accounts/" + TWILLIO.application_sid + "/Messages.json",
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      data: {
        To: phoneNumber,
        Body: body,
        From: "+19714071671"
      }
    })
      .done(this.sentTextMessage)
      .fail(this.failedTextMessage);

  }

  sentTextMessage(response) {
    console.log(response);
  }
  failedTextMessage(xhr) {
    console.error("unable to send text...");
  }


  handleSendClick(e) {
    var phoneNumber = this.dom.input.val();

    this.callbacks.send(phoneNumber);

  }

  renderPopout(x, y) {
    this.dom.modal.css("top", (y + window.scrollY) + "px");
    this.dom.modal.css("left", x + "px");

    this.dom.modal.show();
  }
}

class Pet {
  constructor(pet, callbacks) {
    this.data = pet;
    this.callbacks = callbacks;

    this.handleClick = this.handleClick.bind(this);

    this.dom = {

    };
  }

  handleClick(e) {
    this.callbacks.click(this, e);
  }

  render() {
    var $container = this.dom.container = $("<div>");

    var $listRow = this.dom.listRow = $("<div>", {
      class: "row",
      "data-toggle": "collapse",
      "data-target": `.pet-${this.data.id}`,
      click: this.handleClick
    });

    var $image = this.dom.image = $("<div>", {
      class: "col"
    });

    var $img = this.dom.img = $("<img>", {
      class: "img-thumbnail",
      src: this.data.photos.length ? this.data.photos[0].small : ""
    });

    $image.append($img);

    var $name = this.dom.name = $("<div>", {
      class: "col",
      text: this.data.name
    });

    var $breed = this.dom.breed = $("<div>", {
      class: "col",
      text: this.data.breeds.primary
    });

    var $size = this.dom.size = $("<div>", {
      class: "col",
      text: this.data.size
    });

    var $age = this.dom.age = $("<div>", {
      class: "col",
      text: this.data.age
    });

    $listRow.append($image, $name, $breed, $size, $age);

    var $detailRow = this.dom.detailRow = $("<div>", {
      class: `row collapse pet-${this.data.id}`
    });

    var $description = this.dom.description = $("<div>", {
      class: "card card-body",
      text: this.data.description
    });

    $detailRow.append($description);

    $container.append($listRow);

    return $container;
  }
}

class PetList {
  constructor(elementConfig) {
    this.handleSearch = this.handleSearch.bind(this);

    this.processDataFromServer = this.processDataFromServer.bind(this);
    this.failedDataFromServer = this.failedDataFromServer.bind(this);

    this.processAuthenticationFromServer = this.processAuthenticationFromServer.bind(this);
    this.failedAuthenticationFromServer = this.failedAuthenticationFromServer.bind(this);

    this.handleRowClick = this.handleRowClick.bind(this);
    this.handleTextClick = this.handleTextClick.bind(this);

    this.dom = {
      container: $(elementConfig.container),
      inputs: {
        type: $(elementConfig.typeInput),
        breed: $(elementConfig.breedInput),
        size: $(elementConfig.sizeInput),
        age: $(elementConfig.ageInput),
        zip: $(elementConfig.zipInput)
      },
      buttons: {
        search: $(elementConfig.searchButton),
        previous: $(elementConfig.previousButton),
        next: $(elementConfig.nextButton)
      },
      labels: {
        results: $(elementConfig.resultsLabel),
        pageNumber: $(elementConfig.pageNumberLabel),
        totalPages: $(elementConfig.totalPagesLabel),
      },
      areas: {
        pet: $(elementConfig.petsArea)
      }
    };

    this.pets = [];

    this.token = localStorage["petfinder-auth"] ? JSON.parse(localStorage["petfinder-auth"]) : null;

    var textMeElements = {
      modal: elementConfig.phonePopout,
      input: elementConfig.phoneInput,
      button: elementConfig.phoneTextButton,
    };
    var textMeCallbacks = {
      send: this.handleTextClick
    };
    this.textMe = new TextMe(textMeElements, textMeCallbacks);

  }

  handleRowClick(pet, e) {
    this.textMe.renderPopout(e.clientX, e.clientY);
  }

  handleTextClick(phoneNumber) {
    this.textMe.sendText(phoneNumber, "Hi from my app.");

  }

  authenticate() {
    this.textMe.setUp();

    var now = new Date().getTime();
    if (this.token && this.token.expiry < now) {
      this.getDataFromServer();
    }
    else {
      var body = {
        grant_type: "client_credentials",
        client_id: PETFINDER.client_id,
        client_secret: PETFINDER.client_secret
      };

      // initialize our app
      $.ajax({
        url: "https://api.petfinder.com/v2/oauth2/token",
        method: "POST",
        dataType: "json",
        contentType: "application/x-www-form-urlencoded",
        data: body
      })
        .done(this.processAuthenticationFromServer)
        .fail(this.failedAuthenticationFromServer);
    }
  }

  processAuthenticationFromServer(response) {
    response.expiry = new Date().setSeconds(response.expires_in);

    localStorage["petfinder-auth"] = JSON.stringify(response);
    this.token = response;

    this.getDataFromServer();
  }

  failedAuthenticationFromServer(xhr) {
    console.error("unable to authenticate");
  }

  getDataFromServer() {
    this.getPets();
  }

  addEventListeners() {
    this.dom.buttons.search.on("click", this.handleSearch);
  }

  getFilters() {
    var filters = {};

    var type = this.dom.inputs.type.val();
    if (type)
      filters.type = type;

    var breed = this.dom.inputs.breed.val();
    if (breed)
      filters.breed = breed;

    var size = this.dom.inputs.size.val();
    if (size)
      filters.size = size;

    var age = this.dom.inputs.age.val();
    if (age)
      filters.age = age;

    var location = this.dom.inputs.zip.val();
    if (location)
      filters.location = location;

    return filters;
  }

  handleSearch(e) {
    if (e) e.preventDefault();

    var filters = this.getFilters();

    this.getPets(filters);
  }

  getPets(filters) {
    var options = {
      url: "https://api.petfinder.com/v2/animals",
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.token.access_token}`
      },
      dataType: "json",
      data: filters,
      success: this.processDataFromServer,
      error: this.failedDataFromServer
    };

    $.ajax(options);
  }

  processDataFromServer(response) {
    console.log("we got some pets", response);

    this.pets.length = 0;

    for (var i = 0; i < response.animals.length; i++)
      this.addPet(response.animals[i]);

    this.dom.labels.results.text(response.pagination.total_count);

    this.dom.labels.pageNumber.text(response.pagination.current_page);
    this.dom.labels.totalPages.text(response.pagination.total_pages);

    this.dom.buttons.previous.attr("disabled", response.pagination.current_page === 1);
    this.dom.buttons.next.attr("disabled", response.pagination.current_page === response.pagination.total_pages);

    this.displayAllPets();
  }

  failedDataFromServer(xhr) {
    console.error("Something bad happened", arguments);
  }

  addPet(petData) {
    this.pets.push(new Pet(petData, { click: this.handleRowClick }));
  }

  displayAllPets() {
    //console.log("putting pets on the page, ", this.pets.length)
    var petDom = this.pets.map(v => v.render());

    this.dom.areas.pet.empty().append(petDom);
  }
}
