const randomInt = require(__dirname + '/../modules/randomInt');

module.exports = (array) => {
  if(typeof array !== 'object') throw new Error('Provided value has to be an array object');
  const index = randomInt(0, array.length-1)
  return array[index];
}
