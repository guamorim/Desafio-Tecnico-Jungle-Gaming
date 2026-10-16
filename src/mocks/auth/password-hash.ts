const passwordHashIterations = 100_000;

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) =>
      byte.toString(16).padStart(2, "0"),
    )
    .join("");
}

export function createPasswordSalt() {
  return bytesToHex(
    crypto.getRandomValues(new Uint8Array(16)),
  );
}

export async function hashPassword(
  password: string,
  salt: string,
) {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      iterations: passwordHashIterations,
      salt: encoder.encode(salt),
    },
    passwordKey,
    256,
  );

  return bytesToHex(new Uint8Array(derivedBits));
}
