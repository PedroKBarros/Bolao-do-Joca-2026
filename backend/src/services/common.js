function isValidWhatsappNumber(whatsappNumber) {
  const regex = /^(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?9\d{4}-?\d{4}$/;
  return regex.test(whatsappNumber);
}

module.exports = { isValidWhatsappNumber };