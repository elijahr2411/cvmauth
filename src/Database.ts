import * as mysql from 'mysql2';
import IConfig from './IConfig.js';

export default class Database {
    db : mysql.Connection;
    constructor(config : IConfig) {
        this.db = mysql.createConnection({
            host: config.mysql.host,
            user: config.mysql.user,
            password: config.mysql.pass,
            database: config.mysql.db
        });
        this.query("CREATE TABLE IF NOT EXISTS ips (ip TINYTEXT NOT NULL UNIQUE, banned BOOLEAN NOT NULL DEFAULT 0)");

    }
    checkIp(ip : string) : Promise<IPLookupResult> {
        return new Promise(async (res, rej) => {
            var result = await this.queryPrep("SELECT * FROM ips WHERE ip = ?", [ip]);
            if (!Array.isArray(result)) throw new Error("Mysql returned an invalid response for the query");
            if (result.length == 0) {
                res(IPLookupResult.NotInDatabase);
                return;
                //@ts-ignore
            } else if (result[0].banned === 0) {
                res(IPLookupResult.Whitelisted);
                return;
            } else {
                res(IPLookupResult.Banned);
            }
        });
    }
    updateIP(ip : string, banned : boolean) : Promise<void> {
        return new Promise(async (res, rej) => {
            var status = await this.checkIp(ip);
            if (status == IPLookupResult.NotInDatabase)
                await this.queryPrep("INSERT INTO ips (ip, banned) VALUES (?, ?)", [ip, banned]);
            else
                await this.queryPrep("UPDATE ips SET banned = ? WHERE ip = ?", [banned, ip]);
            res();
        });
    }
    query(query : string) : Promise<mysql.RowDataPacket[] | mysql.RowDataPacket[][] | mysql.OkPacket | mysql.OkPacket[] | mysql.ResultSetHeader> {
        return new Promise((res, rej) => {
            this.db.query(query, (err, result) => {
                if (err) {
                    rej(err);
                    return;
                }
                res(result);
            })
        });
    }
    queryPrep(query : string, values : any) : Promise<mysql.RowDataPacket[] | mysql.RowDataPacket[][] | mysql.OkPacket | mysql.OkPacket[] | mysql.ResultSetHeader> {
        return new Promise((res, rej) => {
            this.db.query(query, values, (err, result) => {
                if (err) {
                    rej(err);
                    return;
                }
                res(result);
            })
        });
    }
}

export enum IPLookupResult {
    NotInDatabase,
    Whitelisted,
    Banned
}