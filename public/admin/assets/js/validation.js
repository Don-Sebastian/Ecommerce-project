const errorName = document.getElementById('nameerror');
const errorEmail = document.getElementById('emailerror');
const errorPassword = document.getElementById('passworderror');
const errorcPassword = document.getElementById('cpassword');
const errorPhonenumber = document.getElementById('phonenumber');
const errorPin = document.getElementById('pinError');
function validateName() {
  const name = document.getElementById('Name').value;
  if (name === '') {
    errorName.innerHTML = 'Enter the name';
    return false;
  }
  if (!name.match(/^[a-zA-Z ]*$/)) {
    errorName.innerHTML = 'Numbers are not allowed';
    return false;
  }
  if (name.match(/^[ ]*$/)) {
    errorName.innerHTML = 'Enter a valid name';
    return false;
  }
  errorName.innerHTML = null;
  return true;
}
function validEmail() {
  const email = document.getElementById('email').value;
  if (email === '') {
    errorEmail.innerHTML = "Email address can't be empty";
    return false;
  }
  // eslint-disable-next-line no-useless-escape
  if (!email.match(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/)) {
    errorEmail.innerHTML = 'Invalid email';
    return false;
  }
  errorEmail.innerHTML = null;
  return true;
}
function validPassowrd() {
  const psd = document.getElementById('password').value;
  if (psd === '') {
    errorPassword.innerHTML = "Password can't be empty";
    return false;
  }
  if (psd.length < 2) {
    errorPassword.innerHTML = "Password shouldn't be less than 2 charactors";
    return false;
  }
  errorPassword.innerHTML = null;
  return true;
}

function cPassowrd() {
  const psd = document.getElementById('password').value;
  const cpsd = document.getElementById('cpassword').value;
  if (cpsd === '') {
    errorcPassword.innerHTML = 'enter a password';
    return false;
  }
  if (cpsd !== psd) {
    errorcPassword.innerHTML = 'password is not matching';
    return false;
  }
  errorcPassword.innerHTML = null;
  return true;
}

function validPhoneumber() {
  const mob = document.getElementById('phonenumber').value;
  if (mob === '') {
    errorPhonenumber.innerHTML = "Phone number can't be empty";
    return false;
  }
  if (mob.length < 10 || !mob.match(/^\d*$/)) {
    errorPhonenumber.innerHTML = 'Phone number must contain 10 numbers';
    return false;
  }
  if (mob.length > 10 || !mob.match(/^\d*$/)) {
    errorPhonenumber.innerHTML = 'Phone number must contain only 10 numbers';
    return false;
  }
  errorPhonenumber.innerHTML = null;
  return true;
}

// eslint-disable-next-line no-unused-vars
function validZipcode() {
  const pin = document.getElementById('pin').value;
  if (pin === '') {
    errorPin.innerHTML = "Zipcode can't be empty";
    return false;
  }
  if (pin.length < 6 || !pin.match(/^\d*$/) || pin.length > 6) {
    errorPin.innerHTML = 'Phone number must be 6 digits';
    return false;
  }
  errorPin.innerHTML = null;
  return true;
}

// eslint-disable-next-line no-unused-vars
function check() {
  // eslint-disable-next-line max-len
  const validatearray = [!validateName(), !validEmail(), !validPassowrd(), !validPhoneumber(), !cPassowrd()];

  // eslint-disable-next-line no-use-before-define
  return validatearray.every(validation);
}

function validation() {
  if (!validateName() || !validEmail() || !validPassowrd() || !validPhoneumber() || !cPassowrd()) {
    return false;
  }
  return true;
}
