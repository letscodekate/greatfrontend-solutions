type Fn<T> = (this: any, ...args: any[]) => T

export default function once<T>(func: Fn<T>): Fn<T> {
    let result: T;
    let hasRun = false;

    return function onceFunction(this: any, ...args: any[]): T {
        if (!hasRun) {
            hasRun = true;
            result = func.apply(this, args);
        }

        return result;
    };
}