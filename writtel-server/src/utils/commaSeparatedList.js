const commaSeparatedList = (array, get) => {
  const out = [];

  if (!array || array.length === 0) {
    return out;
  }

  out.push(get(array[0]));
  for (const item of array.slice(1)) {
    out.push(', ');
    out.push(get(item));
  }
  return out;
};

export default commaSeparatedList;
