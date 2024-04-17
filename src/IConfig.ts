export default interface IConfig {
    mysql : {
        host : string,
        user : string,
        pass : string,
        db : string,
    };
    tests : {
	    ipinfokey : string,
        asn : boolean,
    };
    cvmauth : {
        blockonwarn : boolean,
    };
    http : {
        port: number;
        basedir : string;
    }
}
