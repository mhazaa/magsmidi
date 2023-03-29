import randomInt from './randomInt';

const randomFromArray = (array: any[]): any => {
	const index = randomInt(0, array.length-1);
	return array[index];
};

export default randomFromArray;
  