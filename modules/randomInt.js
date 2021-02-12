module.exports = (min, max) => {
  if(typeof min !== 'number' || typeof max !== 'number') throw new Error('Provided values must be of type number');
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
