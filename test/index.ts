import { expect } from 'chai';
import {
	boolVar,
	checkInt,
	intVar,
	optionalVar,
	requiredVar,
	hostPortsVar,
	trustProxyVar,
	arrayVar,
} from '../src';
import type { HostPort } from '../src';

const varName = 'fruit';
const varNames = ['vegetable', 'fruit'];
const varTests = [
	['single var name', varName],
	['multi var name', varNames],
] as const;
const clearVar = () => {
	delete process.env[varName];
};
const setVar = (v: string) => {
	process.env[varName] = v;
};

beforeEach(() => {
	clearVar();
});

for (const [testType, varTest] of varTests) {
	describe(testType, () => {
		describe('requiredVar', () => {
			it('should throw when the env var is missing', () => {
				expect(() => requiredVar(varTest)).to.throw;
			});
			it('should return the value when the env var exists', () => {
				const value = 'apple';
				setVar(value);
				expect(requiredVar(varTest)).to.equal(value);
			});
		});

		describe('optionalVar', () => {
			const defaultValue = 'banana';
			it('should return undefined when the env var is missing', () => {
				expect(optionalVar(varTest)).to.be.undefined;
			});
			it('should return undefined when the env var is empty', () => {
				setVar('');
				expect(optionalVar(varTest)).to.be.undefined;
			});
			it('should return the default value when the env var is missing', () => {
				expect(optionalVar(varTest, defaultValue)).to.equal(defaultValue);
			});
			it('should return the default value when the env var is empty', () => {
				setVar('');
				expect(optionalVar(varTest, defaultValue)).to.equal(defaultValue);
			});
			it('should return the value when the env var exists', () => {
				const value = 'coconut';
				setVar(value);
				expect(optionalVar(varTest)).to.equal(value);
				expect(optionalVar(varTest, defaultValue)).to.equal(value);
			});
		});

		describe('intVar', () => {
			const defaultValue = 'banana';
			it('should throw when the env var is missing', () => {
				expect(() => intVar(varTest)).to.throw;
			});
			it('should throw when the env var is invalid', () => {
				setVar('date');
				expect(() => intVar(varTest)).to.throw;
			});
			it('should return the default value when the env var is missing', () => {
				expect(intVar(varTest, defaultValue)).to.equal(defaultValue);
			});
			it('should return the default value when the env var is empty', () => {
				setVar('');
				expect(intVar(varTest, defaultValue)).to.equal(defaultValue);
			});
			it('should return the value when the env var is a valid number', () => {
				const value = 123;
				setVar(`${value}`);
				expect(intVar(varTest)).to.equal(value);
				expect(intVar(varTest, defaultValue)).to.equal(value);
			});
		});

		describe('boolVar', () => {
			const defaultValue = 'banana';
			it('should throw when the env var is missing', () => {
				expect(() => boolVar(varTest)).to.throw;
			});
			it('should throw when the env var is invalid', () => {
				setVar('date');
				expect(() => boolVar(varTest)).to.throw;
			});
			it('should return the default value when the env var is missing', () => {
				expect(boolVar(varTest, defaultValue)).to.equal(defaultValue);
			});
			it('should return the default value when the env var is empty', () => {
				setVar('');
				expect(boolVar(varTest, defaultValue)).to.equal(defaultValue);
			});
			it('should return the value when the env var is true', () => {
				const value = true;
				setVar(`${value}`);
				expect(boolVar(varTest)).to.equal(value);
				expect(boolVar(varTest, defaultValue)).to.equal(value);
			});
			it('should return the value when the env var is false', () => {
				const value = false;
				setVar(`${value}`);
				expect(boolVar(varTest)).to.equal(value);
				expect(boolVar(varTest, defaultValue)).to.equal(value);
			});
		});

		describe('arrayVar', () => {
			if (typeof varTest !== 'string') {
				return;
			}
			it('should return undefined array when the env var is missing', () => {
				expect(arrayVar(varTest)).to.be.undefined;
			});
			it('should return an array of one item when there is no delimiter in the string', () => {
				setVar('value1');
				expect(arrayVar(varTest)).to.deep.equal(['value1']);
			});
			it('should return an array of two items when the default delimiter is part of the string', () => {
				setVar('value1,value2,value3');
				expect(arrayVar(varTest)).to.deep.equal(['value1', 'value2', 'value3']);
			});
			it('should include leading & trailing whitespaces in the array values', () => {
				setVar(', value1 , value2 ');
				expect(arrayVar(varTest)).to.deep.equal(['', ' value1 ', ' value2 ']);
			});
			it('should return an array of two items when the provided delimiter is part of the string', () => {
				setVar('val,ue1;val,ue2;val,ue3');
				expect(arrayVar(varTest, { delimiter: ';' })).to.deep.equal([
					'val,ue1',
					'val,ue2',
					'val,ue3',
				]);
			});
			it('should throw when the array includes items that are not part of the allowed values', () => {
				setVar('value1,value2,value3');
				expect(() => arrayVar(varTest, { allowedValues: ['value1', 'value2'] }))
					.to.throw;
			});
		});

		describe('splitHostPort', () => {
			const defaultValue: HostPort[] = [];
			it('should throw when the env var is missing', () => {
				expect(() => hostPortsVar(varTest)).to.throw;
			});
			it('should throw when the env var is invalid', () => {
				setVar('date');
				expect(() => hostPortsVar(varTest)).to.throw;
			});
			it('should return the default value when the env var is missing', () => {
				expect(hostPortsVar(varTest, defaultValue)).to.equal(defaultValue);
			});
			it('should return the default value when the env var is empty', () => {
				setVar('');
				expect(hostPortsVar(varTest, defaultValue)).to.equal(defaultValue);
			});
			it('should return the value when the env var is valid', () => {
				const value = [
					{ host: '127.0.0.1', port: 8080 },
					{ host: '10.0.0.1', port: 80 },
				];
				setVar('127.0.0.1:8080, 10.0.0.1:80');
				expect(hostPortsVar(varTest)).to.deep.equal(value);
				expect(hostPortsVar(varTest, defaultValue)).to.deep.equal(value);
			});
		});

		describe('trustProxyVar', () => {
			const defaultValue = false;
			it('should throw when the env var is missing', () => {
				expect(() => trustProxyVar(varTest)).to.throw;
			});
			it('should throw when the env var is invalid', () => {
				setVar('date');
				expect(() => trustProxyVar(varTest)).to.throw;
			});
			it('should return the default value when the env var is missing', () => {
				expect(trustProxyVar(varTest, defaultValue)).to.equal(defaultValue);
			});
			it('should throw when the default var is invalid', () => {
				setVar('date');
				expect(() => trustProxyVar(varTest, '')).to.throw;
			});
			it('should return the default value when the env var is empty', () => {
				setVar('');
				expect(trustProxyVar(varTest, defaultValue)).to.equal(defaultValue);
			});
			it('should return the value when the env var is a valid number', () => {
				const value = 123;
				setVar(`${value}`);
				expect(trustProxyVar(varTest)).to.equal(value);
				expect(trustProxyVar(varTest, defaultValue)).to.equal(value);
			});
			it('should return the value when the env var is true', () => {
				const value = true;
				setVar(`${value}`);
				expect(trustProxyVar(varTest)).to.equal(value);
				expect(trustProxyVar(varTest, defaultValue)).to.equal(value);
			});
			it('should return the value when the env var is false', () => {
				const value = false;
				setVar(`${value}`);
				expect(trustProxyVar(varTest)).to.equal(value);
				expect(trustProxyVar(varTest, defaultValue)).to.equal(value);
			});
			it('should return the value when the env var is valid', () => {
				const value = '127.0.0.1, 10.0.0.1';
				setVar(value);
				expect(trustProxyVar(varTest)).to.deep.equal(value);
				expect(trustProxyVar(varTest, defaultValue)).to.deep.equal(value);
			});
		});

		describe('checkInt', () => {
			it('should fail on an empty value', () => {
				expect(checkInt('')).to.be.undefined;
			});
			it('should fail on a float', () => {
				expect(checkInt('123.456')).to.be.undefined;
			});
			it('should fail on an exponent', () => {
				expect(checkInt('1e3')).to.be.undefined;
			});
			it('should return the value on a valid integer', () => {
				expect(checkInt('1000')).to.equal(1000);
			});
			it('should return the value on a valid negative integer', () => {
				expect(checkInt('-987')).to.equal(-987);
			});
			it('should return the value on a valid integer with leading/trailing spaces', () => {
				expect(checkInt(' 1000 ')).to.equal(1000);
			});
		});
	});
}
