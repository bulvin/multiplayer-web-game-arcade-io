export function isValidNickname(nickname) {
  if (!nickname || nickname.trim() === "" || nickname.length > 25) {
    return { isValid: false, error: "Nieprawidłowa nazwa gracza." };
  }
  if (/[^a-zA-Z0-9]/.test(nickname)) {
    return { isValid: false, error: "Nazwa gracza może zawierać tylko litery i cyfry." };
  }
  return { isValid: true };
}

  export function isValidRoomName(name, roomControllers) {
    if (!name || name.trim() === "") {
      return { isValid: false, error: "Proszę wprowadzić nazwę pokoju." };
    }
  
    for (const roomController of roomControllers) {
        if (roomController.room.name === name) {
          return { isValid: false, error: "Pokój z tą nazwą już istnieje!" };
        }
      }
  
    return { isValid: true };
  }
  
  export function isValidMaxPlayers(maxPlayers) {
    const players = parseInt(maxPlayers);
    if (isNaN(players) || players < 2 || players > 10) {
      return { isValid: false, error: "Nieprawidłowa liczba graczy." };
    }
  
    return { isValid: true };
  }