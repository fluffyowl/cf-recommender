const API_PREFIX = "http://codeforces.com/api/"

function parseIdFromUrlParameters() {
    return (new URL(document.location)).searchParams.get("cf_handle");
}

async function getJson(url) {
    const response = await fetch(url);
    const json = await response.json();
    return json;
  }

async function getRating(handle) {
    const apiUrl = API_PREFIX + "user.info?handles=" + handle
    const json = await getJson(apiUrl);
    const user = await json.result[0]; // 最初のユーザを取り出す
    return user.rating;
}

window.onload = async function displayContentForId() {
    const handle = parseIdFromUrlParameters();
    if (handle == null) return;

    target = document.getElementById("error_text");
    rating = await getRating(handle);

    target.innerHTML = rating;
}


