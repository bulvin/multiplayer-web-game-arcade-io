export const formatMessage = (playerName, text, type = "chat") => {
    return {
        playerName,
        text,
        type,
        createdAt: new Date().getTime()
    };
}