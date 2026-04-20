let counter = 0;
export const nanoid = (size = 21) => ("x".repeat(size) + counter++).slice(-size);
