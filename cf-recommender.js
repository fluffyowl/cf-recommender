const API_PREFIX = "https://codeforces.com/api/"

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
    return parseInt(user.rating);
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

function createAcceptedProblemsDict(acceptedProblems) {
    var acceptedProblemsDict = {};
    acceptedProblems.forEach(problem => {
        if (problem.name in acceptedProblemsDict) {
            acceptedProblemsDict[problem.name].push(problem);
        } else {
            acceptedProblemsDict[problem.name] = [problem];
        }
    });
    return acceptedProblemsDict;
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function choiceProblemByDifficulty(difficulty, problems, acceptedProblemsDict) {
    var filteredProblems = problems.filter(problem => {
        return parseInt(problem.rating) === difficulty;
    });
    filteredProblems = shuffle(filteredProblems);

    for (var i = 0; i < filteredProblems.length; ++i) {
        var name = filteredProblems[i].name;
        var accepted = false;
        if (!(name in acceptedProblemsDict)) return filteredProblems[i];
        for (var j = 0; j < acceptedProblemsDict[name].length; ++j) {
            var contest1 = parseInt(filteredProblems[i].contestId);
            var contest2 = parseInt(acceptedProblemsDict[name][j].contestId);
            if (Math.abs(contest1 - contest2) <= 1) accepted = true;
        }
        if (!accepted) return filteredProblems[i];
    }

    return null;
}

function generateProblemUrl(problem) {
    return "https://codeforces.com/problemset/problem/" + problem.contestId + "/" + problem.index;
}

function roundRating(rating) {
    var x = rating % 100;
    if (x < 50) return rating - x;
    else return rating + 100 - x;
}

window.onload = async function displayContentForId() {
    const handle = parseIdFromUrlParameters();
    if (handle == null) return;
    document.getElementById("cf_handle").value = handle;

    var target = document.getElementById("dynamic_text");
    var rating = await getRating(handle);
    var problems = await getProblems();
    var acceptedProblems = await getAcceptedProblems(handle);

    var acceptedProblemsDict = createAcceptedProblemsDict(acceptedProblems);
    var minDifficulty = 500;
    var maxDifficulty = 3600;
    var roundedRating = roundRating(rating);
    roundedRating = Math.max(roundedRating, minDifficulty + 200);
    roundedRating = Math.min(roundedRating, maxDifficulty - 200);

    var newInnerHTML = "";
    newInnerHTML += "Your current rating is " + rating.toString() + "<br /><br />";
    newInnerHTML += "Difficulty / Problem<br />";

    for (var i = roundedRating - 200; i <= roundedRating + 200; i += 100) {
        var problem = choiceProblemByDifficulty(i, problems, acceptedProblemsDict);
        if (problem === null) continue;
        var url = generateProblemUrl(problem);
        newInnerHTML += i.toString() + " / <a href=\"" + url + "\" target=\"_blank\">" + problem.contestId + problem.index + ": " + problem.name + "</a><br />";
    }

    target.innerHTML = newInnerHTML;
}


