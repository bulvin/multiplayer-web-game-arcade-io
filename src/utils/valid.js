function isValidNickname(nickname) {
  const disallowedChars = "!@#$%^&*()[]{};:,.<>?/|`~\"'\\+=-_";
  if (!nickname || nickname.trim() === "" || nickname.length > 25) {
      return { isValid: false, error: "Invalid player name." };
  }
  for (let i = 0; i < nickname.length; i++) {
      if (disallowedChars.includes(nickname[i])) {
          return { isValid: false, error: "Player name contains disallowed characters." };
      }
  }
  return { isValid: true };
}

function isValidRoomName(name, roomControllers) {
  if (!name || name.trim() === "") {
      return { isValid: false, error: "Please enter a room name." };
  }

  if (name.length > 25) {
      return { isValid: false, error: "Room name cannot be longer than 25 characters." };
  }

  for (const roomController of roomControllers) {
      if (roomController.room.name === name) {
          return { isValid: false, error: "A room with this name already exists!" };
      }
  }
  return { isValid: true };
}

function isValidMaxPlayers(maxPlayers) {
  const players = parseInt(maxPlayers);
  if (isNaN(players) || players < 2 || players > 8) {
      return { isValid: false, error: "Invalid number of players." };
  }

  return { isValid: true };
}

function isValidToStartGame(gameData, room) {
  const { gameMode, gameTime } = gameData;

  if (room.game) {
      return { isValid: false, error: "The game has already started." };
  }
  if (room.users.length < 1) {
      return { isValid: false, error: "The minimum number of players required to start the game is 1." };
  }

  if (gameMode !== "standard" && gameMode !== "team") {
      return { isValid: false, error: "Invalid game mode." };
  }

  const time = parseInt(gameTime);
  if (isNaN(time) || time < 2 || time > 10) {
      return { isValid: false, error: "Invalid game time. The game time must be between 2 and 10 minutes." };
  }

  return { isValid: true };
}

function isValidJoinRoom(room) {
  if (!room) {
      return { isValid: false, error: "The room does not exist." };
  }
  if (room.users.length >= room.maxPlayers) {
      return { isValid: false, error: "The room is full." };
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
