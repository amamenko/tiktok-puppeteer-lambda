export const safeJsonParse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.error("Failed to parse JSON", error);
    return null;
  }
};
