import crypto from "crypto";

export function encrypt(text: string) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(
    process.env.ENCRYPT_PASSPHRASE as string,
    salt,
    32
  );
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return salt.toString("hex") + ":" + iv.toString("hex") + ":" + encrypted;
}

export function decrypt(encryptedText: string) {
  try {
    const [saltHex, ivHex, encryptedHex] = encryptedText.split(":");
    const salt = Buffer.from(saltHex, "hex");
    const iv = Buffer.from(ivHex, "hex");
    const key = crypto.scryptSync(
      process.env.ENCRYPT_PASSPHRASE as string,
      salt,
      32
    );
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (e) {
    console.error(
      "-- error when decrypt the string:",
      `"${encryptedText}":`,
      e
    );
    return undefined;
  }
}
