export abstract class Test {
    abstract Name : string;
    abstract Test(ip : string) : Promise<TestResult>;
}

export enum TestResult {
    Error,
    Fail,
    Warn,
    Pass
}