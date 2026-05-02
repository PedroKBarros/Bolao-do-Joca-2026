function isValidWhatsappNumber(whatsappNumber) {
  const regex = /^(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?9\d{4}-?\d{4}$/;
  return regex.test(whatsappNumber);
}

function isValidPositiveNumberOrZero(number, canHaveDecimalPart = true, expectedDecimalSeparator = '.') {
  if (typeof number !== 'string') return false;

  // Escapa o separador caso seja um caractere especial em regex
  const escapedSeparator = expectedDecimalSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  let regex;

  if (canHaveDecimalPart) {
    // Inteiro + opcional decimal
    regex = new RegExp(`^\\d+(${escapedSeparator}\\d+)?$`);
  } else {
    // Apenas inteiro
    regex = /^\d+$/;
  }

  return regex.test(number);
}

function isValidWhatsAppGroupUrl(url) {
  if (typeof url !== 'string') return false;

  const regex = /^(https?:\/\/)?(www\.)?chat\.whatsapp\.com\/[A-Za-z0-9]{20,30}$/;

  return regex.test(url.trim());
}

function isValidDate(dateStr){
  try{
    const [year, month, day] = dateStr.split("-").map(Number);

    const date = new Date(year, month - 1, day);

    // validação real (evita 31/02 virar março)
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return false;
    }
}catch{
  return false;
}

  return true;  
}

function parseDate(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  // validação real (evita 31/02 virar março)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error("Data inválida");
  }

  return date;
}

function returnDateWithZeroTime(date){
  const dateObj = new Date(date);
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
}

function formatDateToDataBase(date){
  let dateObj = new Date(date); 
  dateObj
  .toISOString()
  .slice(0, 19)
  .replace('T', ' ');
  return dateObj;
}



module.exports = { isValidWhatsappNumber, isValidPositiveNumberOrZero, isValidWhatsAppGroupUrl, 
  parseDate, isValidDate, returnDateWithZeroTime, formatDateToDataBase };