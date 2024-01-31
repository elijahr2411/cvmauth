import { Test, TestResult } from "../test.js";
// I HATE THIS FIX YOUR LIBRARY
//import { createRequire } from "module";
//const { Address4, Address6 } = createRequire(import.meta.url)("ip-address") as typeof import("ip-address");
import axios from "axios";
//import { isIP } from "net";
//import { Resolver } from "node:dns";
import log from "../log.js";

export default class ASNTest implements Test {
    Name : string = "ASN";
    BannedASNs : string[];
    ipinfokey : string;
    // resolver : Resolver;
    Test(ip: string): Promise<TestResult> {
        return new Promise<TestResult>(async (res, rej) => {
		var result : any;
		try {
			result = (await axios.get(`https://ipinfo.io/${ip}?token=${this.ipinfokey}`)).data;
		} catch (e:any) {
			log("ERROR", `Failed to query ipinfo: ${e.message}`);
			res(TestResult.Error);
			return;
		}
		if (this.BannedASNs.indexOf(result.org.split(" ")[0]) !== -1) {
			res(TestResult.Fail);
			return;
		} else {
			res(TestResult.Pass);
			return;
		}
           /* var asnraw : string[][];
            switch (isIP(ip)) {
                case 4: {
                    var addr = new Address4(ip);
                    asnraw = await this.resolveTxt(`${addr.reverseForm({omitSuffix: true})}.origin.asn.cymru.com`);
                    break;
                }
                case 6: {
                    var addr6 = new Address6(ip);
                    asnraw = await this.resolveTxt(`${addr6.reverseForm({omitSuffix: true})}.origin6.asn.cymru.com`);
                    break;
                }
                default:
                    log("ERROR", `Invalid IP address ${ip}`);
                    res(TestResult.Error);
                    return;
            }
            var asn : string = "AS" + asnraw[0][0].split(" | ")[0];
            if (this.BannedASNs.indexOf(asn) !== -1) {
                res(TestResult.Fail);
                return;
            } else {
                res(TestResult.Pass);
                return;
            }*/
        });
    }
    constructor(asnlist : string[], ipinfokey : string) {
        this.BannedASNs = asnlist;
	this.ipinfokey = ipinfokey;
        //this.resolver = new Resolver();
    }
    // Wrapper function because node core modules have promisephobia
    /*private resolveTxt(query : string) : Promise<string[][]> {
        return new Promise((res, rej) => {
            this.resolver.resolveTxt(query, (err, result) => {
                if (err) {
                    rej(err);
                    return;
                }
                res(result);
            });
        });
    }*/
}
