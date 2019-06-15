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

async function getAcceptedProblems(handle) {
    const apiUrl = API_PREFIX + "user.status?handle=" + handle;
    const json = await getJson(apiUrl);
    const submissions = await json.result;
    return submissions.filter(submission => {
        return submission.verdict === "OK";
    }).map(submission => {
        return submission.problem;
    });
}

async function getProblems() {
    const apiUrl = API_PREFIX + "problemset.problems";
    const json = await getJson(apiUrl);
    const problems = await json.result.problems;
    return problems;
}

window.onload = async function displayContentForId() {
    const handle = parseIdFromUrlParameters();
    if (handle == null) return;

    target = document.getElementById("error_text");
    rating = await getRating(handle);
    acceptedProblems = await getAcceptedProblems(handle);
    problems = await getProblems();

    target.innerHTML = rating;
}


