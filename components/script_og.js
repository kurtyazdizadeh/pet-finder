var CLIENT_ID = "sVE4FPH6lHbBjl1IzqV9uH5HPEzz67qNUWrbfvnnMdKUHXPmKg";
var CLIENT_SECRET = "GFoFWvxSMKNxtmxsaw3S73QEjIAWDm73jYfZQyIq";

var body = {
  grant_type: "client_credentials",
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET
};

$(() => {
  if (localStorage["petfinder-auth"]) {
    var auth = JSON.parse(localStorage["petfinder-auth"]);

    var now = new Date().getTime();

    if (auth.expiry < now) {
      authenticate();
    }
    else {
      getDataFromServer();
    }

  }
  else {
    authenticate();
  }
});

function authenticate() {

  // initialize our app
  $.ajax({
    url: "https://api.petfinder.com/v2/oauth2/token",
    method: "POST",
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
    data: body
  })
    .done(processCredsFromServer)
    .fail(failedAuth);

}

function processCredsFromServer(response) {
  response.expiry = new Date().setSeconds(response.expires_in);

  localStorage["petfinder-auth"] = JSON.stringify(response);
  getDataFromServer();
}

function failedAuth(xhr) {
  console.error("unable to authenticate");
}

function getDataFromServer() {
  console.log("getting data from server...");
  var auth = JSON.parse(localStorage["petfinder-auth"]);
  ////-
  $.ajax({
    url: "https://api.petfinder.com/v2/oauth2/token",
    method: "GET",
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
    headers: {
      Authorization: "Bearer " + auth.access_token
    },
    data: body
  })
    .done(processCredsFromServer)
    .fail(failedAuth);
}
