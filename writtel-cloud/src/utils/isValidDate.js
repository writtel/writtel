
const isValidDate = (date) => {
  date = new Date(date);
  return date instanceof Date && !isNaN(date.getTime());
};

module.exports = isValidDate;
