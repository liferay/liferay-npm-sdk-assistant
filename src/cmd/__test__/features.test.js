import {tryLevelDecrement} from '../features';

const breakpoints = [
	{version: [2, 0, 0], level: 200},
	{version: [1, 1, 0], level: 110},
	{version: [1, 0, 1], level: 101},
	{version: [1, 0, 0], level: 100},
];

describe('tryLevelDecrement()', () => {
	it('works', () => {
		expect(tryLevelDecrement(1000, [3, 0, 0], breakpoints)).toEqual(200);
		expect(tryLevelDecrement(1000, [2, 1, 0], breakpoints)).toEqual(200);
		expect(tryLevelDecrement(1000, [2, 0, 1], breakpoints)).toEqual(200);
		expect(tryLevelDecrement(1000, [2, 0, 0], breakpoints)).toEqual(200);
		expect(tryLevelDecrement(1000, [1, 9, 0], breakpoints)).toEqual(110);
		expect(tryLevelDecrement(1000, [1, 2, 0], breakpoints)).toEqual(110);
		expect(tryLevelDecrement(1000, [1, 1, 0], breakpoints)).toEqual(110);
		expect(tryLevelDecrement(1000, [1, 0, 9], breakpoints)).toEqual(101);
		expect(tryLevelDecrement(1000, [1, 0, 1], breakpoints)).toEqual(101);
		expect(tryLevelDecrement(1000, [1, 0, 0], breakpoints)).toEqual(100);
		expect(tryLevelDecrement(1000, [0, 9, 9], breakpoints)).toEqual(0);
	});
});
