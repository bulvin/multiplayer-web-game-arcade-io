function isValidNickname(nickname) {
  const disallowedChars = "!@#$%^&*()[]{};:,.<>?/|`~\"'\\+=-_";
  if (!nickname || nickname.trim() === "" || nickname.length > 25) {
    return { isValid: false, error: "Nieprawidłowa nazwa gracza." };
  }
  for (let i = 0; i < nickname.length; i++) {
    if (disallowedChars.includes(nickname[i])) {
      return { isValid: false, error: "Nazwa gracza zawiera niedozwolone znaki." };
    }
  }
  return { isValid: true };
}

function isValidRoomName(name, roomControllers) {
  if (!name || name.trim() === "") {
    return { isValid: false, error: "Proszę wprowadzić nazwę pokoju." };
  }

  if (name.length > 25) {
    return { isValid: false, error: "Nazwa pokoju nie może być dłuższa niż 25 znaków." };
  }

  for (const roomController of roomControllers) {
    if (roomController.room.name === name) {
      return { isValid: false, error: "Pokój z tą nazwą już istnieje!" };
    }
  }
  return { isValid: true };
}

function isValidMaxPlayers(maxPlayers) {
  const players = parseInt(maxPlayers);
  if (isNaN(players) || players < 2 || players > 8) {
    return { isValid: false, error: "Nieprawidłowa liczba graczy." };
  }

  return { isValid: true };
}

function isValidToStartGame(gameData, room) {
 
  const {gameMode, gameTime} = gameData;
 
  if (room.game) {
    return { isValid: false, error: "Gra już została rozpoczęta." };
  }
  if (room.users.length < 1) {
    return { isValid: false, error: "Minimalna liczba graczy do rozpoczęcia gry to 1." };
  }

  if (gameMode !== "standard" && gameMode !== "team") {
    return { isValid: false, error: "Nieprawidłowy tryb gry." };
  }

  const time = parseInt(gameTime);
  if (isNaN(time) || time < 2 || time > 10) {
    return { isValid: false, error: "Nieprawidłowy czas gry. Czas gry musi być między 2 a 10 minut." };
  }

  return { isValid: true };
}

function isValidJoinRoom(room) { 
  if (!room) { 
    return { isValid: false, error: "Pokój nie istnieje." };
  }
  if (room.users.length >= room.maxPlayers) {
    return { isValid: false, error: "Pokój jest pełny." };
  }

  return { isValid: true };

}

export {
  isValidNickname,
  isValidRoomName,
  isValidMaxPlayers,
  isValidToStartGame,
  isValidJoinRoom
};
