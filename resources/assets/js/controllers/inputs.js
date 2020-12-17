/*var lowerCaseLetters = /[a-z]/g;
if (value.match(lowerCaseLetters)) {
  check(letter)
} else {
  uncheck(letter)
}
var upperCaseLetters = /[A-Z]/g;
if (value.match(upperCaseLetters)) {
  check(capital)
} else {
  uncheck(capital)
}
var numbers = /[0-9]/g;
if (value.match(numbers)) {
  check(number)
} else {
  uncheck(number)
}
var symbols = /[-!$%^&*()_+|~#=`{}\[\]:";'<>?,.\/]/g;
if (value.match(symbols)) {
  check(symbol)
} else {
  uncheck(symbol)
}
// Validate length
if (value.length >= 8 && value.length <= 16) {
  check(length);
} else {
  uncheck(length);
}


function addErrorDate() {
  const dateText = document.getElementById('error_date');
  const curDate = new Date();
  const minDate = new Date(curDate.setFullYear(curDate.getFullYear() - 100));
  const maxDate = new Date(
    curDate.setFullYear(curDate.getFullYear() + 100 - 18)
  );
  dateText.textContent = '';
  dateText.textContent = `Data não pode ser menor que
   ${minDate.toLocaleDateString()} e maior que ${maxDate.toLocaleDateString()}`;
  document.getElementById('message_date').style.display = 'block';
}*/
