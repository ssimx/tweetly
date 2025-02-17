// Helper function to handle errors
export function getErrorMessage(error: unknown): string {
    let message: string;

    // error is new Error
    if (error instanceof Error) {
        message = error.message;
    } // error is object with message
    else if (error && typeof error === 'object' && 'message' in error) {
        message = String(error.message);
    } // error is object with error
    else if (error && typeof error === 'object' && 'error' in error) {
        message = String(error.error);
    } // error is just a string
    else if (typeof error === 'string') {
        message = error;
    } // anything else is unknown
    else {
        message = 'Something went wrong';
    }

    return message;
};