export const SECONDS_PER_HOUR = 60 * 60;
/**
 * In milliseconds
 */
export const SECONDS = 1000;
/**
 * In milliseconds
 */
export const MINUTES = 60 * SECONDS;
/**
 * In milliseconds
 */
export const HOURS = 60 * MINUTES;
/**
 * In milliseconds
 */
export const DAYS = 24 * HOURS;

/**
 * Ensure an env var exists and return the contents if it does
 */
export const requiredVar = (varName: string | string[]): string => {
	const s = optionalVar(varName);
	if (s == null) {
		throw new Error(`Missing environment variable: ${varName}`);
	}
	return s;
};

/**
 * Fetches the contents of an env var if it exists and is not empty, otherwise returning the specified default value,
 * this means that if no default is specified then `''` will be normalized to `undefined`
 */
export function optionalVar<R>(
	varName: string | string[] | string[],
	defaultValue: R,
): string | R;
export function optionalVar(
	varName: string | string[] | string[],
	defaultValue?: undefined,
): string | undefined;
export function optionalVar<R>(
	varName: string | string[] | string[],
	defaultValue?: R,
): string | R | undefined {
	// If there's a single string var name then fetch it directly from process.env, returning the default as necessary
	if (typeof varName === 'string') {
		const s = process.env[varName];
		if (s == null || s === '') {
			return defaultValue;
		}
		return s;
	}

	// Otherwise for a list then we loop through and return the first valid one, otherwise we return the default value
	for (const name of varName) {
		const s = optionalVar(name);
		if (s != null) {
			return s;
		}
	}
	return defaultValue;
}

/**
 * Checks that a string is a valid int and returns the number if so
 */
export const checkInt = (s: string): number | undefined => {
	if (typeof s !== 'string') {
		throw new Error(`checkInt parameter must be string`);
	}
	s = s.trim();
	if (!/^-?[0-9]+$/.test(s)) {
		return;
	}
	const i = parseInt(s, 10);
	if (!Number.isFinite(i)) {
		return;
	}
	return i;
};

/**
 * Fetches the contents of an env var, ensuring it is a valid integer if set,
 * if it is not set then instead it returns the specified default value
 */
export function intVar(varName: string | string[]): number;
export function intVar<R>(
	varName: string | string[],
	defaultValue: R,
): number | R;
export function intVar<R>(
	varName: string | string[],
	defaultValue?: R,
): number | R {
	if (arguments.length === 1) {
		requiredVar(varName);
	}

	const s = optionalVar(varName);
	if (s == null) {
		return defaultValue!;
	}

	const i = checkInt(s);
	if (i === undefined) {
		throw new Error(`${varName} must be a valid number if set`);
	}
	return i;
}

/**
 * Fetches the contents of an env var, ensuring it is a valid boolean (`'true'`/`'false'`) if set,
 * if it is not set then instead it returns the specified default value
 */
export function boolVar(varName: string | string[]): boolean;
export function boolVar<R>(
	varName: string | string[],
	defaultValue: R,
): boolean | R;
export function boolVar<R>(
	varName: string | string[],
	defaultValue?: R,
): boolean | R {
	if (arguments.length === 1) {
		requiredVar(varName);
	}

	const s = optionalVar(varName);
	if (s == null) {
		return defaultValue!;
	}
	if (s === 'false') {
		return false;
	}
	if (s === 'true') {
		return true;
	}
	throw new Error(
		`Invalid value for boolean var '${varName}', got '${s}', expected 'true' or 'false'`,
	);
}

export type HostPort = { host: string; port: number };
/**
 * Splits an env var in the format of `${host1}:${port1}, ${host2}:${port2}, ...`
 * into an array of individual host/port pairings
 */
export const hostPortsVar = (
	varName: string | string[],
	defaultHosts?: HostPort[],
): HostPort[] => {
	const hostPairs = optionalVar(varName);
	if (hostPairs == null) {
		if (defaultHosts == null) {
			throw new Error(`Missing environment variable: ${varName}`);
		}
		return defaultHosts;
	}
	return hostPairs.split(',').map((hostPair): HostPort => {
		const [host, maybePort] = hostPair.trim().split(':');
		if (maybePort == null || host == null) {
			throw new Error(`Invalid port for '${varName}': ${maybePort}`);
		}
		const port = checkInt(maybePort);
		if (port == null) {
			throw new Error(`Invalid port for '${varName}': ${maybePort}`);
		}
		return { host, port };
	});
};

/**
 * Parses a "trust proxy" env var designed for use with express' trust proxy setting,
 * ie it will parse 'true'/'false' into a boolean for express and '123'/etc into a number
 * so that express will be able to handle those correctly
 */
export const trustProxyVar = <R>(
	varName: string | string[],
	defaultValue?: R,
): boolean | string | number | R => {
	const trustProxy = optionalVar(varName);
	if (trustProxy == null) {
		if (defaultValue == null) {
			throw new Error(`Missing environment variable: ${varName}`);
		}
		return defaultValue;
	}
	if (trustProxy == null) {
		throw new Error(`Missing environment variable: ${varName}`);
	}
	if (trustProxy === 'true') {
		// If it's 'true' enable it
		return true;
	}
	if (trustProxy === 'false') {
		// If it's 'false' disable it
		return false;
	}
	if (trustProxy.includes('.') || trustProxy.includes(':')) {
		// If it looks like an ip use as-is
		return trustProxy;
	}

	const trustProxyNum = checkInt(trustProxy);
	if (trustProxyNum != null) {
		// If it's a number use the number
		return trustProxyNum;
	}

	throw new Error(`Invalid value for '${varName}' of '${trustProxy}'`);
};
