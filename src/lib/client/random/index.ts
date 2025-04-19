export const simpleHash = (value: string) => {
	let hash = 0;
	if (value.length === 0) return hash;
	for (let i = 0; i < value.length; i++) {
		const char = value.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}
	return hash;
};

export const createSeededRandomGenerator = (seed: number) => {
	return () => {
		const x = Math.sin(seed++) * 10000;
		return x - Math.floor(x);
	};
};

export const creatDiagonalArrayIndices = (size: number, numberCols: number = 4) => {
	const mappedArray2D: number[][] = Array.from({ length: Math.ceil(size / numberCols) }, () =>
		Array.from({ length: numberCols }, () => -1)
	);
	let tmpArray2D: { x: number; y: number }[] = [];
	let index = 0;
	for (let iterator = 0; iterator < numberCols * 2 - 1; iterator++) {
		if (iterator === 0) {
			mappedArray2D[0][0] = index;
			tmpArray2D = [{ x: 0, y: 0 }];
			index += 1;
			continue;
		}
		tmpArray2D = tmpArray2D
			.map(({ x, y }) => {
				const tmp = [];
				const newX = x + 1;
				const newY = y + 1;
				if (newX < numberCols && mappedArray2D[newX][y] === -1) tmp.push({ x: newX, y });
				if (newY < numberCols && mappedArray2D[x][newY] === -1) tmp.push({ x, y: newY });
				const sortedTmp = tmp.sort((a, b) => a.y - b.y);
				sortedTmp.forEach((t) => {
					if (index < size) {
						mappedArray2D[t.x][t.y] = index;
						index += 1;
					}
				});
				return sortedTmp;
			})
			.flat();
	}
	const test = mappedArray2D.flat().filter((e) => e !== -1);
	console.log('mapped', JSON.stringify(test));
	return test;
};

export const mapArrayToDiagonalArray = <T extends object>(inputArray: Array<T>, rowSize: number) =>
	creatDiagonalArrayIndices(inputArray.length, rowSize).map((index) => inputArray[index]);

export const generateSeededRandomNumbers = (seedString: string) => {
	// Convert the string seed into a numeric seed using a simple hash function
	const seed = simpleHash(seedString);
	// Create a seeded random number generator
	const seededRandom = createSeededRandomGenerator(seed);
	const maxConsecutive = 2;
	const minNumber = 0;
	const maxNumber = 13;
	const randomNumbers: Array<number> = [];
	for (let i = 0; i < 7; i++) {
		let randomNumber = Math.floor(seededRandom() * (maxNumber - minNumber + 1)) + minNumber;
		// Ensure the generated number is unique
		while (randomNumbers.includes(randomNumber)) {
			randomNumber = Math.floor(seededRandom() * (maxNumber - minNumber + 1)) + minNumber;
		}
		// Check the last two elements to ensure no more than two consecutive numbers
		while (
			randomNumbers.length >= maxConsecutive &&
			randomNumbers[randomNumbers.length - 1] === randomNumber &&
			randomNumbers[randomNumbers.length - 2] === randomNumber
		) {
			randomNumber = Math.floor(seededRandom() * (maxNumber - minNumber + 1)) + minNumber;
		}
		randomNumbers.push(randomNumber);
	}
	return randomNumbers.sort((a, b) => a - b);
};
