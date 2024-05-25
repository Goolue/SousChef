export async function measureDuration<T>(functionName: string, fn: () => T): Promise<T> {
    console.log(`starting function ${functionName}`);

    const start = Date.now();
    const result = await fn();
    const end = Date.now();

    console.log(`Function ${functionName} took ${end - start}ms to execute`);
    return result;
}