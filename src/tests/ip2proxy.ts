import axios from "axios";
import { Test, TestResult } from "../test.js";
import log from "../log.js";

export default class ip2proxyTest implements Test {
    Name: string = "ip2proxy";
    Test(ip: string): Promise<TestResult> {
        return new Promise(async (res, rej) => {
            var result : string;
            try {
                result = (await axios.get(`https://www.ip2proxy.com/demo?ip=${ip}`, {
                    headers: {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/109.0"} // trolled
                })).data;
            } catch (e:any) {
                log("ERROR", `Failed to query ip2proxy: ${e.message}`);
                res(TestResult.Error);
                return;
            }
            if (result.includes("Good news! This IP address is not a known proxy IP address.")) {
                res(TestResult.Pass);
            } else {
                res(TestResult.Fail);
            }
        });
    }

}