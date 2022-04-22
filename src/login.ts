import * as fs from 'fs';
import * as base64 from 'base-64';
import axios from 'axios';
import { Agent } from 'https';

const assistSettings = process.env.APPDATA + '\\Assist\\Settings.json';
const file: any = fs.readFileSync(assistSettings);
const data = JSON.parse(file);
const name = fs.readFileSync('config', 'utf8').trim();

const clientVersion = "release-04.07-shipping-15-699063";

async function reauth() {
    var cAuth64;
    var puuid;

    for(let i = 0; i < data.Accounts.length; i++) {
        if(data.Accounts[i].Gamename == name) {
            cAuth64 = data.Accounts[i].cAuth64;
            puuid = data.Accounts[i].puuid;
        }
    }

    const cookiesb64 = cAuth64.split(';a;');
    var cookies;
    for(let i = 0; i < cookiesb64.length; i++) {
        if(base64.decode(cookiesb64[i]).includes('ssid=')) {
            cookies = base64.decode(cookiesb64[i]);
        }
    }

    let a = await setupReauth(cookies);
    //console.log(a);
    return {
        userDetails: a,
        puuid: puuid
    }
}

const ciphers = [
    'TLS_CHACHA20_POLY1305_SHA256',
    'TLS_AES_128_GCM_SHA256',
    'TLS_AES_256_GCM_SHA384',
    'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256'
];
// agent with custom cipher suites
const agent = new Agent({
    ciphers: ciphers.join(':'),
    honorCipherOrder: true,
    minVersion: 'TLSv1.2'
});

const createSession = (ssidCookie) => axios({
    url: 'https://auth.riotgames.com/api/v1/authorization',
    method: 'POST',
    headers: {
        ...typeof ssidCookie === 'undefined' ? '' : { Cookie: ssidCookie },
        'User-Agent': 'RiotClient/43.0.1.4195386.4190634 rso-auth (Windows; 10;;Professional, x64)'
    },
    data: {
        client_id: "play-valorant-web-prod",
        nonce: 1,
        redirect_uri: "https://playvalorant.com/opt_in",
        response_type: "token id_token",
        // response params are returned as a query instead of hash
        // URL class can properly parse params this way
        response_mode: "query",
        // this gives us a bigger response on /userinfo + required
        // for auto detecting region
        scope: "account openid"
    },
    httpsAgent: agent
});

const setupReauth = async (ssidCookie) => {
    // access token -> every 1h | id token -> every 24h
    var tokens;
    const response = await createSession(ssidCookie);

    ssidCookie = response.headers['set-cookie'].find(elem => /^ssid/.test(elem));
    tokens = { ...tokens, ...parseUrl(response.data.response.parameters.uri) };
    tokens.entitlementsToken = await fetchEntitlements(tokens.accessToken);
    return makeHeaders(tokens);
}

const parseUrl = (uri) => {
    const loginResponseURI = new URL(uri);
    const accessToken = loginResponseURI.searchParams.get('access_token');
    const idToken = loginResponseURI.searchParams.get('id_token')
    const expiresIn = parseInt(
        loginResponseURI.searchParams.get('expires_in'));

    return { accessToken, idToken, expiresIn };
}

const makeHeaders = (tokens) => {
    var headers = {
        Authorization: `Bearer ${tokens.accessToken}`,
        entitlements: tokens.entitlementsToken.data.entitlements_token,
        'X-Riot-ClientVersion': clientVersion,
        'X-Riot-ClientPlatform': 'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9',
    }
    return headers;
}

const fetchEntitlements = (accessToken) => axios({
    url: 'https://entitlements.auth.riotgames.com/api/token/v1',
    method: 'POST',
    headers: {
        Authorization: `Bearer ${accessToken}`
    },
    data: {}
});

export default reauth;