const API_BASE = "https://v2.jokeapi.dev/joke";

const moodButtons = document.querySelectorAll(".mood");
const getJokeBtn = document.getElementById("getJokeBtn");
const jokeCard = document.getElementById("jokeCard");
const jokeText = document.getElementById("jokeText");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");
const errorText = document.getElementById("errorText");
const categoryLabel = document.getElementById("categoryLabel");
const jokeNumber = document.getElementById("jokeNumber");
const jokeStatus = document.getElementById("jokeStatus");
const jokesServed = document.getElementById("jokesServed");
const laughScore = document.getElementById("laughScore");
const streak = document.getElementById("streak");
const streakText = document.getElementById("streakText");
const streakBar = document.getElementById("streakBar");
const missionNumber = document.getElementById("missionNumber");

let selectedCategory = "Misc";
let served = 0;
let score = 0;
let funStreak = 0;
let currentJokeLoaded = false;

const categoryNames = {
  Misc: "RANDOM FUN",
  Pun: "DAD JOKES",
  Programming: "CODER LAUGHS"
};

moodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    moodButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    selectedCategory = button.dataset.category;
    categoryLabel.textContent = categoryNames[selectedCategory];
  });
});

async function getJoke() {
  setLoading(true);
  hideError();

  getJokeBtn.disabled = true;
  jokeStatus.textContent = "CONNECTING...";
  jokeCard.classList.remove("waiting");

  const url =
    `${API_BASE}/${selectedCategory}` +
    "?type=single" +
    "&safe-mode" +
    "&blacklistFlags=nsfw,religious,political,racist,sexist,explicit";

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("The comedy server returned an error.");
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.message || "The Joke Bot could not find a joke.");
    }

    if (!data.joke) {
      throw new Error("No joke was returned. Try another mission.");
    }

    showJoke(data.joke);

    served += 1;
    currentJokeLoaded = true;

    jokesServed.textContent = served;
    jokeNumber.textContent = `#${String(served).padStart(3, "0")}`;
    missionNumber.textContent = String(served).padStart(2, "0");
    jokeStatus.textContent = "DELIVERED ✓";
  } catch (error) {
    showError(error.message);
    jokeStatus.textContent = "SIGNAL ERROR";
  } finally {
    setLoading(false);
    getJokeBtn.disabled = false;
  }
}

function showJoke(joke) {
  jokeText.textContent = joke;

  jokeText.animate(
    [
      { opacity: 0, transform: "translateY(10px)" },
      { opacity: 1, transform: "translateY(0)" }
    ],
    {
      duration: 400,
      easing: "ease-out"
    }
  );
}

function setLoading(isLoading) {
  loading.classList.toggle("hidden", !isLoading);
}

function showError(message) {
  errorText.textContent = message;
  errorBox.classList.remove("hidden");
}

function hideError() {
  errorBox.classList.add("hidden");
}

function updateStats() {
  laughScore.textContent = score;
  streak.textContent = funStreak;
  streakText.textContent = `${funStreak} / 5`;

  const percentage = Math.min(funStreak, 5) * 20;
  streakBar.style.width = `${percentage}%`;
}

document.querySelectorAll(".reaction").forEach((button) => {
  button.addEventListener("click", () => {
    if (!currentJokeLoaded) {
      return;
    }

    const reaction = button.dataset.reaction;

    if (reaction === "laugh") {
      score += 10;
      funStreak += 1;
    }

    if (reaction === "okay") {
      score += 5;
      funStreak += 1;
    }

    if (reaction === "again") {
      funStreak = 0;
      getJoke();
    }

    if (funStreak >= 5) {
      score += 25;
      funStreak = 0;
      jokeStatus.textContent = "BONUS! +25";
    }

    updateStats();
  });
});

getJokeBtn.addEventListener("click", getJoke);

updateStats();
