document.addEventListener("DOMContentLoaded", () => {
  // DOM refs
  const playerNameLabel = document.getElementById("playerNameLabel");
  const roundInfo = document.getElementById("roundInfo");

  const userScoreEl = document.getElementById("userScore");
  const robotScoreEl = document.getElementById("robotScore");

  const userChoiceRow = document.getElementById("userChoice");
  const robotChoiceRow = document.getElementById("computerChoice");

  const userAvatarBox = document.getElementById("userAvatarBox").querySelector("img");
  const robotAvatarBox = document.getElementById("robotAvatarBox").querySelector("img");

  const popup = document.getElementById("popup");
  const popupText = document.getElementById("popupText");

  // State
  const playerName = localStorage.getItem("playerName") || "Player";
  const maxRounds = parseInt(localStorage.getItem("maxRounds") || "5", 10);
  let round = 0;
  let userScore = 0;
  let robotScore = 0;
  let locked = false;

  playerNameLabel.textContent = playerName;

  const robotCards = Array.from(robotChoiceRow.querySelectorAll(".choice-card"));
  const userCards  = Array.from(userChoiceRow.querySelectorAll(".choice-card"));

  // Thinking effect on robot until user picks
  let thinkTimer = null;
  function startThinking() {
    stopThinking();
    thinkTimer = setInterval(() => {
      robotCards.forEach(c => c.classList.remove("thinking"));
      const idx = Math.floor(Math.random() * robotCards.length);
      robotCards[idx].classList.add("thinking");
    }, 420);
  }
  function stopThinking() {
    clearInterval(thinkTimer);
    robotCards.forEach(c => c.classList.remove("thinking"));
  }

  // Helpers
  const normalize = v => (v || "").toLowerCase().trim();
  const robotPick = () => ["stone","paper","scissors"][Math.floor(Math.random()*3)];

  function clearSelections() {
    [...userCards, ...robotCards].forEach(c => {
      c.classList.remove("selected-green", "selected-yellow");
    });
    userAvatarBox.classList.remove("avatar-win", "avatar-lose", "avatar-draw");
    robotAvatarBox.classList.remove("avatar-win", "avatar-lose", "avatar-draw");
  }

  function updateHeader() {
    roundInfo.textContent = `Round ${Math.min(round+1, maxRounds)}/${maxRounds} • Series: ${userScore} – ${robotScore}`;
  }

  function updateScores() {
    userScoreEl.textContent  = `User: ${userScore}`;
    robotScoreEl.textContent = `Robot: ${robotScore}`;
  }

function showPopup() {
  let msg = "";
  if (userScore > robotScore) msg = `${playerName} Wins 🎉`;
  else if (robotScore > userScore) msg = "Robot Wins 🤖";
  else msg = "It's a Draw!";

  popupText.textContent = msg;
  popup.classList.add("is-open");   
}


  function findRobotCard(choice) {
    return robotCards.find(card => normalize(card.querySelector("img")?.alt) === normalize(choice));
  }

  // Outcome logic
  function decide(user, robot) {
    if (user === robot) return "draw";
    const userWin =
      (user === "stone" && robot === "scissors") ||
      (user === "paper" && robot === "stone") ||
      (user === "scissors" && robot === "paper");
    return userWin ? "user" : "robot";
  }

  // User click -> play a round
  userCards.forEach(card => {
    card.addEventListener("click", () => {
      if (locked || round >= maxRounds) return;
      locked = true;

      stopThinking();
      clearSelections();

      const userChoice  = normalize(card.dataset.choice);
      const robotChoice = robotPick();
      const robotCard   = findRobotCard(robotChoice);

      const isDraw = userChoice === robotChoice;
      if (isDraw) {
        card.classList.add("selected-yellow");
        robotCard?.classList.add("selected-yellow");
      } else {
        card.classList.add("selected-green");
        robotCard?.classList.add("selected-green");
      }

      const result = decide(userChoice, robotChoice);
      if (result === "user") {
        userScore++;
        userAvatarBox.classList.add("avatar-win");
        robotAvatarBox.classList.add("avatar-lose");
      } else if (result === "robot") {
        robotScore++;
        userAvatarBox.classList.add("avatar-lose");
        robotAvatarBox.classList.add("avatar-win");
      } else {
        userAvatarBox.classList.add("avatar-draw");
        robotAvatarBox.classList.add("avatar-draw");
      }

      round++;
      updateScores();
      updateHeader();

      if (round === maxRounds) {
        setTimeout(() => {
          showPopup();
        }, 850);
      } else {
        setTimeout(() => {
          clearSelections();
          startThinking();
          locked = false;
        }, 900);
      }
    });
  });

  // init
  updateScores();
  updateHeader();
  startThinking();
});
