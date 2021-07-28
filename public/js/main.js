const BASE_URL = 'http://localhost:8000/';
let url = BASE_URL + "user/1";
const options = {
    headers: {
        // This is how the server will know to initialize a JsonResponse object and not an HtmlResponse.
        Accept: "application/json"
    }
};
const doStuff = (data) => {
    // If the request was successful, then `data` will have everything you asked for.
    console.log(data);
}

fetch(url, options)
    .then(response => response.json())
    .then(data => {
        doStuff(data);
    })
    .catch(function(error) {
        // If there is any error you will catch them here.
        console.error(error);
    });


