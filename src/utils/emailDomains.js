export const extractDomain = (email) => {
  if (!email.includes("@")) return null;
  return email.split("@")[1].toLowerCase();
};
