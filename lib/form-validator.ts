const ALLOWED_DOMAINS = [
  "rland.ph",
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
];

const ALLOWED_DOMAINS_REGEX = new RegExp(`^(${ALLOWED_DOMAINS.join("|")})$`);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(09|\+639)\d{9}$/;
const NAME_REGEX = /^[a-zA-Z\s]+$/;
const EMPLOYEE_ID_REGEX = /^RLDI\d{8}$/;

const validateEmail = (email: string) => {
  return EMAIL_REGEX.test(email) && ALLOWED_DOMAINS_REGEX.test(email.split("@")[1]);
};

const validatePhone = (phone: string) => {
  return PHONE_REGEX.test(phone);
};

const validateName = (name: string) => {
  return NAME_REGEX.test(name);
};

const validateEmployeeId = (employeeId: string) => {
  return EMPLOYEE_ID_REGEX.test(employeeId);
};

export { validateEmail, validatePhone, validateName, validateEmployeeId };