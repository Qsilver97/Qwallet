export const checkPasswordStrength = (password: string) => {
  let strength = 0;

  // Criteria 1: Minimum length of 8 characters
  if (password.length >= 8) {
    strength += 1;
  }

  // Criteria 2: Contains both lower and uppercase characters
  if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
    strength += 1;
  }

  // Criteria 3: Contains digits
  if (password.match(/([0-9])/)) {
    strength += 1;
  }

  // Criteria 4: Contains symbols
  if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) {
    strength += 1;
  }

  return strength;
};
