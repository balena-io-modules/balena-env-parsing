import { expect } from 'chai';
import {
	boolVar,
	checkInt,
	HostPort,
	intVar,
	optionalVar,
	requiredVar,
	hostPortsVar,
	trustProxyVar,
} from '../src';

const varName = 'test';
const clearVar = () => {
	delete process.env[varName];
};
const setVar = (v: string) => {
	process.env[varName] = v;
};

beforeEach(() => {
	clearVar();
});

describe('requiredVar', () => {
	it('should throw when the env var is missing', () => {
		expect(() => requiredVar(varName)).to.throw;
	});
	it('should return the value when the env var exists', () => {
		const value = 'apple';
		setVar(value);
		expect(requiredVar(varName)).to.equal(value);
	});
});

describe('optionalVar', () => {
	const defaultValue = 'banana';
	it('should return undefined when the env var is missing', () => {
		expect(optionalVar(varName)).to.be.undefined;
	});
	it('should return undefined when the env var is empty', () => {
		setVar('');
		expect(optionalVar(varName)).to.be.undefined;
	});
	it('should return the default value when the env var is missing', () => {
		expect(optionalVar(varName, defaultValue)).to.equal(defaultValue);
	});
	it('should return the default value when the env var is empty', () => {
		setVar('');
		expect(optionalVar(varName, defaultValue)).to.equal(defaultValue);
	});
	it('should return the value when the env var exists', () => {
		const value = 'coconut';
		setVar(value);
		expect(optionalVar(varName)).to.equal(value);
		expect(optionalVar(varName, defaultValue)).to.equal(value);
	});
});

describe('intVar', () => {
	const defaultValue = 'banana';
	it('should throw when the env var is missing', () => {
		expect(() => intVar(varName)).to.throw;
	});
	it('should throw when the env var is invalid', () => {
		setVar('date');
		expect(() => intVar(varName)).to.throw;
	});
	it('should return the default value when the env var is missing', () => {
		expect(intVar(varName, defaultValue)).to.equal(defaultValue);
	});
	it('should return the default value when the env var is empty', () => {
		setVar('');
		expect(intVar(varName, defaultValue)).to.equal(defaultValue);
	});
	it('should return the value when the env var is a valid number', () => {
		const value = 123;
		setVar(`${value}`);
		expect(intVar(varName)).to.equal(value);
		expect(intVar(varName, defaultValue)).to.equal(value);
	});
});

describe('boolVar', () => {
	const defaultValue = 'banana';
	it('should throw when the env var is missing', () => {
		expect(() => boolVar(varName)).to.throw;
	});
	it('should throw when the env var is invalid', () => {
		setVar('date');
		expect(() => boolVar(varName)).to.throw;
	});
	it('should return the default value when the env var is missing', () => {
		expect(boolVar(varName, defaultValue)).to.equal(defaultValue);
	});
	it('should return the default value when the env var is empty', () => {
		setVar('');
		expect(boolVar(varName, defaultValue)).to.equal(defaultValue);
	});
	it('should return the value when the env var is true', () => {
		const value = true;
		setVar(`${value}`);
		expect(boolVar(varName)).to.equal(value);
		expect(boolVar(varName, defaultValue)).to.equal(value);
	});
	it('should return the value when the env var is false', () => {
		const value = false;
		setVar(`${value}`);
		expect(boolVar(varName)).to.equal(value);
		expect(boolVar(varName, defaultValue)).to.equal(value);
	});
});

describe('splitHostPort', () => {
	const defaultValue: HostPort[] = [];
	it('should throw when the env var is missing', () => {
		expect(() => hostPortsVar(varName)).to.throw;
	});
	it('should throw when the env var is invalid', () => {
		setVar('date');
		expect(() => hostPortsVar(varName)).to.throw;
	});
	it('should return the default value when the env var is missing', () => {
		expect(hostPortsVar(varName, defaultValue)).to.equal(defaultValue);
	});
	it('should return the default value when the env var is empty', () => {
		setVar('');
		expect(hostPortsVar(varName, defaultValue)).to.equal(defaultValue);
	});
	it('should return the value when the env var is valid', () => {
		const value = [
			{ host: '127.0.0.1', port: 8080 },
			{ host: '10.0.0.1', port: 80 },
		];
		setVar('127.0.0.1:8080, 10.0.0.1:80');
		expect(hostPortsVar(varName)).to.deep.equal(value);
		expect(hostPortsVar(varName, defaultValue)).to.deep.equal(value);
	});
});

describe('trustProxyVar', () => {
	const defaultValue = false;
	it('should throw when the env var is missing', () => {
		expect(() => trustProxyVar(varName)).to.throw;
	});
	it('should throw when the env var is invalid', () => {
		setVar('date');
		expect(() => trustProxyVar(varName)).to.throw;
	});
	it('should return the default value when the env var is missing', () => {
		expect(trustProxyVar(varName, defaultValue)).to.equal(defaultValue);
	});
	it('should throw when the default var is invalid', () => {
		setVar('date');
		expect(() => trustProxyVar(varName, '')).to.throw;
	});
	it('should return the default value when the env var is empty', () => {
		setVar('');
		expect(trustProxyVar(varName, defaultValue)).to.equal(defaultValue);
	});
	it('should return the value when the env var is a valid number', () => {
		const value = 123;
		setVar(`${value}`);
		expect(trustProxyVar(varName)).to.equal(value);
		expect(trustProxyVar(varName, defaultValue)).to.equal(value);
	});
	it('should return the value when the env var is true', () => {
		const value = true;
		setVar(`${value}`);
		expect(trustProxyVar(varName)).to.equal(value);
		expect(trustProxyVar(varName, defaultValue)).to.equal(value);
	});
	it('should return the value when the env var is false', () => {
		const value = false;
		setVar(`${value}`);
		expect(trustProxyVar(varName)).to.equal(value);
		expect(trustProxyVar(varName, defaultValue)).to.equal(value);
	});
	it('should return the value when the env var is valid', () => {
		const value = '127.0.0.1, 10.0.0.1';
		setVar(value);
		expect(trustProxyVar(varName)).to.deep.equal(value);
		expect(trustProxyVar(varName, defaultValue)).to.deep.equal(value);
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
