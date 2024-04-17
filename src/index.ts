import * as fs from 'node:fs';
import toml from 'toml';
import IConfig from './IConfig.js';
import { Test, TestResult } from './test.js';
import ASNTest from './tests/asn.js';
import log from './log.js';
import Database, { IPLookupResult } from './Database.js';
import { isIP } from 'node:net';
import fastify from 'fastify';
import * as url from 'url';

process.chdir(url.fileURLToPath(new URL('..', import.meta.url))); // THIS IS A HACK
var Config : IConfig;
try {
    var confraw = fs.readFileSync("config.toml").toString();
    Config = toml.parse(confraw);
} catch (e : any) {
    log("FATAL", `Failed to read or parse the config file: ${e.message}`);
    process.exit(1);
}

var tests : Test[] = [];

if (Config.tests.asn) {
    if (!fs.existsSync("asn_blacklist")) {
        log("FATAL", "For ASN testing you need to have a file named asn_blacklist containing a list of banned ASNs.");
        process.exit(1);
    }
    var ASNList : string[] = [];
    var asnlistraw = fs.readFileSync("asn_blacklist").toString();
    asnlistraw.split('\n').filter(a=>a.startsWith("AS")).forEach(a => ASNList.push(a.split(' ')[0]));
    tests.push(new ASNTest(ASNList, Config.tests.ipinfokey));
}

var database = new Database(Config);

if (process.argv.length > 2) {
    if (process.argv.length != 4) {
        console.log("Usage: index.js <ban | whitelist> <ip>");
        process.exit(1);
    }
    switch (process.argv[2]) {
        case "ban":
                await database.updateIP(process.argv[3], true);
            break;
        case "whitelist":
                await database.updateIP(process.argv[3], false);
            break;
    }
    process.exit(0);
}

function testIP(ip : string) : Promise<boolean> {
    return new Promise(async (res, rej) => {
        if (isIP(ip) === 0) {
            log("ERROR", `${ip} is not an IP. This is usually a misconfiguration of your web server.`);
            res(false);
            return;
        }
        // Check if the IP is already in the database
        var status = await database.checkIp(ip);
        if (status === IPLookupResult.Banned) {
            res(false);
            return;
        } else if (status === IPLookupResult.Whitelisted) {
            res(true);
            return;
        }
        // Run tests
        var passed = true;
        testloop:
        for (var i = 0; i < tests.length; i++) {
            var result = await tests[i].Test(ip);
            switch (result) {
                case TestResult.Pass:
                    log("PASS", `${ip} passed ${tests[i].Name} test.`);
                    break;
                case TestResult.Warn:
                    log("WARN", `${ip} recieved warn from ${tests[i].Name} test.`);
                    if (Config.cvmauth.blockonwarn) {
                        passed = false;
                        break testloop;
                    }
                    break;
                case TestResult.Fail:
                    log("FAIL", `${ip} failed ${tests[i].Name} test.`);
                    passed = false;
                    break testloop;
                    break;
                case TestResult.Error:
                    log("ERROR", `${tests[i].Name} failed while testing ${ip}, continuing`);
                    break;
            }
        }
        database.updateIP(ip, !passed);
        if (passed) {
            log("PASS", `Whitelisting ${ip}`);
            res(true);
            return;
        } else {
            log("BLOCK", `Blocking ${ip}`);
            res(false);
            return;
        }
    });
}
// Make sure we're only testing each IP once at a time
log("INFO", `Starting CollabVM Authenticator`);
var testingips : string[] = [];
var http = fastify();
http.get(Config.http.basedir, async (request, response) => {
    if (!request.headers["x-forwarded-for"]) {
        log("ERROR", "X-Forwarded-For was not set. This is probably a misconfiguration of your webserver.");
        response.code(500);
        return;
    }
    if (typeof request.headers["x-forwarded-for"] !== 'string') {
        log("ERROR", "X-Forwarded-For contained invalid data");
        response.code(500);
        return;
    } 
    var ip = request.headers["x-forwarded-for"].replaceAll(" ", "").split(",")[0];
    if (testingips.indexOf(ip) !== -1) {
        response.code(403);
        return "";
    }
    testingips.push(ip);
    var result = await testIP(ip);
    response.code(result ? 200 : 403);
    testingips.splice(testingips.indexOf(ip), 1);
    return "";
});
http.listen({
    port: Config.http.port
});
