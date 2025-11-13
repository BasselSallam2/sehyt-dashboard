/* eslint-disable @typescript-eslint/no-explicit-any */
export class ApiError extends Error {
    constructor(public message: string, public status: number , public data?: any) {
        super(message);
    }
}