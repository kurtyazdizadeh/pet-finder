class List {
  constructor(body, elementConfig){
    this.processCredsFromServer = this.processCredsFromServer.bind(this);
    this.processDataFromServer = this.processDataFromServer.bind(this);
    this.failedAuth = this.failedAuth.bind(this);
    this.processTypesFromServer = this.processTypesFromServer.bind(this);
    this.processBreedsFromServer = this.processBreedsFromServer.bind(this);
    this.getBreedsFromServer = this.getBreedsFromServer.bind(this);

    this.handleRowClick = this.handleRowClick.bind(this);
    this.handleSearch = this.handleSearch.bind(this);

    this.body = body;

    this.dom = {
      inputs: {
        type: $(elementConfig.inputs.type),
        breed: $(elementConfig.inputs.breed),
        size: $(elementConfig.inputs.size),
        age: $(elementConfig.inputs.age),
        zip: $(elementConfig.inputs.zip)
      },
      petList: {
        list: $(elementConfig.petList.list)
      },
      buttons: {
        search: $(elementConfig.buttons.search),
        previous: $(elementConfig.buttons.previous),
        next: $(elementConfig.buttons.next),
        text: $(elementConfig.buttons.text)
      },
      labels: {
        results: $(elementConfig.labels.results),
        pageNumber: $(elementConfig.labels.pageNumber),
        totalPages: $(elementConfig.labels.totalPages)
      }
    }

    this.animals = [];
    this.token = localStorage["petfinder-auth"] ? JSON.parse(localStorage["petfinder-auth"]) : null;
  }
  authenticate(body) {
    var now = new Date().getTime();
    if (this.token && this.token.expiry < now) {
      this.getDataFromServer();
    }
    else {
      $.ajax({
        url: "https://api.petfinder.com/v2/oauth2/token",
        method: "POST",
        dataType: "json",
        contentType: "application/x-www-form-urlencoded",
        data: body
      })
        .done(this.processCredsFromServer)
        .fail(this.failedAuth);
    }
  }
  processCredsFromServer(response) {
    response.expiry = new Date().setSeconds(response.expires_in);
    localStorage["petfinder-auth"] = JSON.stringify(response);
    this.token = response;

    this.getDataFromServer();
  }
  failedAuth(xhr) {
    console.error("unable to authenticate", xhr);
  }
  getDataFromServer() {
    $.ajax({
      url: "https://api.petfinder.com/v2/animals/",
      method: "GET",
      dataType: "json",
      headers: {
        Authorization: "Bearer " + this.token.access_token
      },
      data: {} //FILTERS ON GET REQUEST
    })
      .done(this.processDataFromServer)
      .fail(this.failedAPI);
  }
  processDataFromServer(response) {
    this.loadAnimals(response.animals);
    this.render(this.animals);

    this.dom.labels.results.text(response.pagination.total_count);
    this.dom.labels.pageNumber.text(response.pagination.current_page);
    this.dom.labels.totalPages.text(response.pagination.total_pages);

    //disables button if on first or last page
    //(can't go past first or last page)
    this.dom.buttons.previous.attr("disabled", response.pagination.current_page === 1);
    this.dom.buttons.next.attr("disabled", response.pagination.current_page === response.pagination.total_pages);

  }
  failedAPI(xhr) {
    console.error("failed API call:", xhr)
  }

  loadAnimals(animalList) {
    this.animals = [];
    animalList.forEach(animal => this.addAnimal(animal));
  }
  render(animalList) {
    var animalRows = animalList.map(v => v.renderListItem());
    this.dom.petList.list
      .empty()
      .append(animalRows);
  }

  addAnimal(animalData) {
    var animal = new Animal(animalData, { click: this.handleRowClick });
    this.animals.push(animal);

    return this.animals.length;
  }
  addEventListeners(){
    this.dom.inputs.type.change(this.getBreedsFromServer);
    this.dom.buttons.search.click(this.handleSearch);
  }

  getFilters(){
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
  getPets(filters){
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

  getBreedsFromServer(){
    var type = this.dom.inputs.type.val()

    $.ajax({
      url: `https://api.petfinder.com/v2/types/${type}/breeds`,
      method: "GET",
      dataType: "json",
      contentType: "application/x-www-form-urlencoded",
      headers: {
        Authorization: "Bearer " + this.token.access_token
      }
    })
      .done(this.processBreedsFromServer)
      .fail(this.failedAPI);
  }
  getTypesFromServer(){
    var auth = JSON.parse(localStorage["petfinder-auth"]);

    $.ajax({
      url: "https://api.petfinder.com/v2/types",
      method: "GET",
      dataType: "json",
      contentType: "application/x-www-form-urlencoded",
      headers: {
        Authorization: "Bearer " + auth.access_token
      }
    })
      .done(this.processTypesFromServer)
      .fail(this.failedAPI);
  }
  handleRowClick(animal){
    console.log("Row was clicked")
  }

  processBreedsFromServer(response){
    this.dom.inputs.breed.empty();
    response.breeds.forEach(breed => this.renderBreed(breed));
  }

  processTypesFromServer(response){
    response.types.forEach(type =>  this.renderType(type));
  }
  renderBreed(breed){
    var $breedOption = $("<option>", { value: breed.name, text: breed.name });
    this.dom.inputs.breed.append($breedOption);
  }
  renderType(type){
    var $typeOption = $("<option>", {value: type.name, text: type.name });
    this.dom.inputs.type.append($typeOption);
  }


}
