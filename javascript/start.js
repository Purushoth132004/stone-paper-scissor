document.getElementById("startForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("playerName").value.trim() || "Player";
  const roundsInput = parseInt(document.getElementById("rounds").value, 10);
  const rounds = isNaN(roundsInput) || roundsInput <= 0 ? 5 : roundsInput;

  localStorage.setItem("playerName", name);
  localStorage.setItem("maxRounds", String(rounds));

  localStorage.setItem("userScore", "0");
  localStorage.setItem("robotScore", "0");
  localStorage.setItem("round", "0");

  window.location.href = "game.html";
});
