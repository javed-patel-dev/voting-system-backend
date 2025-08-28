import { extractDomain } from "../../utils/emailDomains.js";

const { ALLOWED_EMAIL_DOMAINS } = process.env;

const allowedDomains = ALLOWED_EMAIL_DOMAINS
  ? ALLOWED_EMAIL_DOMAINS.split(",").map((d) => d.trim().toLowerCase())
  : [];

export const isEmailDomainAllowed = (email) => {
  const domain = extractDomain(email);
  if (!domain) return false;

  if (allowedDomains.length === 0) {
    return true; // no restriction
  }

  return allowedDomains.includes(domain);
};

export const getEmailTemplateName = (name) => {
  const emailTemplateNameMapper = {
    REGISTER: "registration",
    LOGIN: "login",
    PASSWORD_RESET: "resetpassword",
  };
  return emailTemplateNameMapper[name] || "general";
};