export const nanoid = (size = 10) =>
  Array.from(crypto.getRandomValues(new Uint8Array(size)))
    .map((b) => (b % 36).toString(36))
    .join("");
