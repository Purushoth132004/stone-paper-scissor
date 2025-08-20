document.addEventListener("DOMContentLoaded", () => {

  const playerNameLabel = document.getElementById("playerNameLabel");
  const series = document.getElementById("series");
  const roundInfo = document.getElementById("roundInfo");

  const userScoreEl = document.getElementById("userScore");
  const robotScoreEl = document.getElementById("robotScore");

  const userChoiceRow = document.getElementById("userChoice");
  const robotChoiceRow = document.getElementById("computerChoice");

  const userAvatarBox = document.getElementById("userAvatarBox").querySelector("img");
  const robotAvatarBox = document.getElementById("robotAvatarBox").querySelector("img");

  const popup = document.getElementById("popup");
  const popupText = document.getElementById("popupText");

  const playerName = localStorage.getItem("playerName") || "Player";
  const maxRounds = parseInt(localStorage.getItem("maxRounds") || "5", 10);

  let round = 0;
  let userScore = 0;
  let robotScore = 0;
  let locked = false;
  let roundHistory = [];

  playerNameLabel.textContent = playerName;

  const robotCards = Array.from(robotChoiceRow.querySelectorAll(".choice-card"));
  const userCards  = Array.from(userChoiceRow.querySelectorAll(".choice-card"));

  // --- THINKING ANIMATION ---
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

  // --- HELPERS ---
  const normalize = v => (v || "").toLowerCase().trim();

  // Purely random decision
  function getRobotMove() {
    const choices = ["stone", "paper", "scissors"];
    return choices[Math.floor(Math.random() * choices.length)];
  }

  // Optional smart mode (counter to user’s choice)
  function getSmartMove(userChoice) {
    if (userChoice === "stone") return "paper";
    if (userChoice === "paper") return "scissors";
    if (userChoice === "scissors") return "stone";
    return getRobotMove();
  }

  function clearSelections() {
    [...userCards, ...robotCards].forEach(c => {
      c.classList.remove("selected-green", "selected-yellow");
    });
    userAvatarBox.classList.remove("avatar-win", "avatar-lose", "avatar-draw");
    robotAvatarBox.classList.remove("avatar-win", "avatar-lose", "avatar-draw");
  }

  function updateHeader() {
    roundInfo.textContent = `Round ${Math.min(round+1, maxRounds)}/${maxRounds}`;
  }

  function updateRound(){
    series.textContent = `${playerName}: ${userScore} - ${robotScore} : Robot`;
  }

  function updateScores() {
    userScoreEl.textContent  = `${playerName}: ${userScore}`;
    robotScoreEl.textContent = `Robot: ${robotScore}`;
  }

  function showPopup() {
    let msg = "";
    if (userScore > robotScore) msg = `${playerName} Wins the Game 🎉`;
    else if (robotScore > userScore) msg = "Robot Wins the Game 🤖";
    else msg = "It's a Draw!";

    let historyHTML = roundHistory.map(r => `<li>${r}</li>`).join("");

    popupText.innerHTML = `
      <p>${msg}</p>
      <h3>Game Summary:</h3>
      <ul>${historyHTML}</ul>`;
    popup.classList.add("is-open");   
  }

  function findRobotCard(choice) {
    return robotCards.find(card => normalize(card.querySelector("img")?.alt) === normalize(choice));
  }

  function decide(user, robot) {
    if (user === robot) return "draw";
    const userWin =
      (user === "stone" && robot === "scissors") ||
      (user === "paper" && robot === "stone") ||
      (user === "scissors" && robot === "paper");
    return userWin ? "user" : "robot";
  }

  // --- MAIN GAME LOOP ---
  userCards.forEach(card => {
    card.addEventListener("click", () => {
      if (locked || round >= maxRounds) return;
      locked = true;

      stopThinking();
      clearSelections();

      const userChoice  = normalize(card.dataset.choice);

      // Robot decides AFTER user clicks (unpredictable)
      const robotChoice = getRobotMove(); 
      // Or enable smart mode instead:
      // const robotChoice = getSmartMove(userChoice);

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

      let roundMsg = "";
      if (result === "user") {
        userScore++;
        userAvatarBox.classList.add("avatar-win");
        robotAvatarBox.classList.add("avatar-lose");
        roundMsg = `Round ${round+1}: ${playerName} wins`;
      } else if (result === "robot") {
        robotScore++;
        userAvatarBox.classList.add("avatar-lose");
        robotAvatarBox.classList.add("avatar-win");
        roundMsg = `Round ${round+1}: Robot wins`;
      } else {
        userAvatarBox.classList.add("avatar-draw");
        robotAvatarBox.classList.add("avatar-draw");
        roundMsg = `Round ${round+1}: Draw`;
      }

      roundHistory.push(roundMsg);

      round++;
      updateScores();
      updateRound();
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

  updateScores();
  updateHeader();
  startThinking();
});
