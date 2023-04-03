export abstract class BadRequestError extends Error {
    constructor(
        public statusCode: number,
        message: string
    ) {
        super(message)
    }
}