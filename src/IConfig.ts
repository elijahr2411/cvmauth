export default interface IConfig {
    mysql : {
        host : string,
        user : string,
        pass : string,
        db : string,
    };
    tests : {
        asn : boolean,
        spur : boolean,
        ip2proxy : boolean,
    };
    cvmauth : {
        blockonwarn : boolean,
    };
    http : {
        port: number;
        basedir : string;
    }
}