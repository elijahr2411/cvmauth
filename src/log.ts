export default function log(loglevel : string, message : string) {
    console.log(`[${new Date().toLocaleString()}] [${loglevel}] ${message}`);
}