export const asString = (u: unknown): string => {
  if (typeof u === "string") {
    return u;
  }

  throw new Error("Value is not a string");
};

export const asNumber = (u: unknown): number => {
  if (typeof u === "number") {
    return u;
  }

  throw new Error("Value is not a number");
};

