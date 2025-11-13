import { ApiError } from "./errorsHandlers/ApiError.handler";

interface IExtractOptions {
    filter?: boolean;
    strict?: boolean;
}

export function dtoHandler<T extends Record<string, any>>(
    body: unknown,
    keys: { required: string[]; optional: string[] },
    options: IExtractOptions = {}
): T {
    const { filter = true, strict = false } = options;

    if (typeof body !== 'object' || body === null) {
        if (strict) {
            throw new ApiError('Invalid request body', 400);
        }
        return ;
    }

    const bodyObj = body as Record<string, unknown>;

    const bodyKeys = new Set(Object.keys(bodyObj));
    const requiredKeys = new Set(keys.required);
    const allExpectedKeys = new Set([...keys.required, ...keys.optional]);

    const foundMissingKeys: string[] = [];
    const foundExtraKeys: string[] = [];

    for (const reqKey of requiredKeys) {
        if (bodyObj[reqKey] === undefined || bodyObj[reqKey] === null) {
            foundMissingKeys.push(reqKey);
        }
    }

    for (const bodyKey of bodyKeys) {
        if (!allExpectedKeys.has(bodyKey)) {
            foundExtraKeys.push(bodyKey);
        }
    }

    if (strict) {
        if (foundMissingKeys.length > 0) {
            throw new ApiError(`Missing required keys: ${foundMissingKeys.join(', ')}`, 400);
        }
        if (foundExtraKeys.length > 0) {
            throw new ApiError(`Found unexpected keys: ${foundExtraKeys.join(', ')}`, 400);
        }
    }

    const result: Record<string, unknown> = {};

    if (filter) {
        for (const key of bodyKeys) {
            if (allExpectedKeys.has(key)) {
                result[key] = bodyObj[key];
            }
        }
    } else {
        Object.assign(result, bodyObj);
    }

    return result as T;
}