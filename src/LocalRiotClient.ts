import axios from 'axios';
import * as fs from 'fs';
import * as https from 'https';

class LocalRiotClient {

    username: string;
    password: string;
    port: string;
    authorization: any;
    axios: any;

    constructor(username: string, password: string, port: string) {

        this.username = username;
        this.password = password;
        this.port = port;

        //local auth header
        this.authorization = Buffer.from(`${this.username}:${this.password}`, 'utf8').toString('base64');

        //base axios request
        this.axios = axios.create({

            baseURL: `https://127.0.0.1:${this.port}`,
            headers: {
                'Authorization': `Basic ${this.authorization}`,
                "user-agent": "ShooterGame/21 Windows/10.0.19042.1.768.64bit",
                "X-Riot-ClientVersion": "release-03.02-shipping-5-584286",
                "Content-Type": "application/json",
                "rchat-blocking": "true"
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false, // disable ssl verification for self signed cert used by RiotClientServices.exe,

            })

        });

    }

    static initFromLockFile() : boolean | LocalRiotClient | any {

        const lockFile = this.parseLockFile();
        if(lockFile != false) {

            return new LocalRiotClient('riot', lockFile.password, lockFile.port);

        } else {

            return false;

        }

    }

    static gameOpen() : boolean {

        const lockFile = this.parseLockFile();
        if(lockFile != false) {

            return true;

        } else {

            return false;

        }
    }

    static parseLockFile() : any {
    
        const path = `${process.env.LOCALAPPDATA}\\Riot Games\\Riot Client\\Config\\lockfile`;     

        // read lockfile
        if(fs.existsSync(path)) {
            const lockfileContents = fs.readFileSync(path, 'utf8');

        /**
         * expected lockfile contents
         * name:pid:port:password:https
         */
            const matches = lockfileContents.split(':');
            const name = matches[0];
            const pid = matches[1];
            const port = matches[2];
            const password = matches[3];
            const protocol = matches[4];

            return {
                'raw': lockfileContents,
                'name': name,
                'pid': pid,
                'port': port,
                'password': password,
                'protocol': protocol,
            }

        } else {

            return false;

        }

    }

    getFriends() {
        return this.axios.get('/chat/v4/friends');
    }

    getSession() {
        return this.axios.get("/chat/v1/session")
    }

    getPresence() {
        return this.axios.get('/chat/v4/presences');
    }

    getHelp() {
        return this.axios.get('/help');
    }

    getCredentials() {
        return this.axios.get("/entitlements/v1/token")
    }

    getServerRegion() {
        return this.axios.post("player-affinity/product/v1/token", {
            product: "valorant"
        });
    }

}

export default LocalRiotClient;