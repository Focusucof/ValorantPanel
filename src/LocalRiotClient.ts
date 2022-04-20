import axios, { Axios } from 'axios';
import * as fs from 'fs';
import * as https from 'https';

interface LockFile {
    raw: string;
    name: string;
    pid: string;
    port: string;
    password: string;
    protocol: string;
}

class LocalRiotClient {
    username: string;
    password: string;
    port: string;
    authorization: string;
    axios: any;

    constructor(username: string, password: string, port: string) {
        this.username = username;
        this.password = password;
        this.port = port;
        this.authorization = Buffer.from(`${username}:${password}`).toString('base64');
        this.axios = axios.create({
            baseURL: `https://127.0.0.1:${port}`,
            headers: {
                Authorization: `Basic ${this.authorization}`,
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false, // ignore self-signed certs
            }),
            
        });
    }

    static initFromLockFile(): any {
        const lockfile = this.parseLockFile();
        if(lockfile) {
            return new LocalRiotClient('riot', lockfile.password, lockfile.port);
        } else {
            return false;
        }
    }

    static gameOpen(): boolean {
        const lockfile = this.parseLockFile();
        if(lockfile) {
            return true;
        } else {
            return false;
        }
    }

    static parseLockFile():  LockFile | undefined {
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

        }

        // falsy if lockfile doesn't exist
        return;
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