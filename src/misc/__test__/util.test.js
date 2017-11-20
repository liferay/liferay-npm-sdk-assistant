import {parseVersion, lessThan, formatVersion} from '../util';

describe('parseVersion()', () => {
	it('works', () => {
		expect(parseVersion('3.0.0.0')).toBeUndefined();
		expect(parseVersion('1.2.3')).toEqual([1, 2, 3]);
		expect(parseVersion('1.2')).toEqual([1, 2, 0]);
		expect(parseVersion('1')).toEqual([1, 0, 0]);
		expect(parseVersion('')).toBeUndefined();
	});
});

describe('lessThan()', () => {
	it('works', () => {
		expect(lessThan([1, 0, 1], [1, 0, 0])).toEqual(false);
		expect(lessThan([1, 1, 0], [1, 0, 0])).toEqual(false);
		expect(lessThan([2, 0, 0], [1, 0, 0])).toEqual(false);

		expect(lessThan([1, 0, 0], [1, 0, 0])).toEqual(false);

		expect(lessThan([1, 0, 0], [1, 0, 1])).toEqual(true);
		expect(lessThan([1, 0, 0], [1, 1, 0])).toEqual(true);
		expect(lessThan([1, 0, 0], [2, 0, 0])).toEqual(true);
	});
});

describe('formatVersion()', () => {
	it('works', () => {
		expect(formatVersion([1, 2, 3])).toEqual('1.2.3');
		expect(formatVersion([3, 2, 1])).toEqual('3.2.1');
		expect(formatVersion(undefined)).toEqual('[undefined]');

		expect(() => formatVersion([])).toThrow();
		expect(() => formatVersion([1])).toThrow();
		expect(() => formatVersion([1, 2])).toThrow();
		expect(() => formatVersion([1, 2, 3, 4])).toThrow();
	});
});
