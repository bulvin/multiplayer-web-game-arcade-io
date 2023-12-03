import crypto from "crypto"

export const generateUuid = () => {
    return crypto.randomUUID();
}