import { Test, TestResult } from "../test.js";
import axios from "axios";
import log from "../log.js";

export default class SpurTest implements Test {
    Name : string = "Spur.us";
    Test(ip: string): Promise<TestResult> {
        return new Promise(async (res, rej) => {
            var result : string;
            try {
                result = (await axios.get(`https://spur.us/context/${ip}`, {
                    headers: {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/109.0"} // trolled
                })).data;
            } catch (e:any) {
                log("ERROR", `Failed to query Spur: ${e.message}`);
                res(TestResult.Error);
                return;
            }
            if (result.includes("is part of")) {
				res(TestResult.Fail);
			} else if (result.includes("Open Proxy")) {
				res(TestResult.Fail);
			} else if (result.includes("Possible Proxy")) {
				res(TestResult.Warn);
			} else if (result.includes("Likely Anonymous")) {
				res(TestResult.Warn);
			} else {
				res(TestResult.Pass);
			}
        });
    }

}