import LocalRiotClient from "./LocalRiotClient";
import axios, { Axios, AxiosInstance } from "axios";
import ranks from "./ranks";

const xRiotClientPlatform = "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9";
const clientVersion = "release-04.07-shipping-15-699063";

async function main() {
    var userDetails: any = {};
    let client = LocalRiotClient.initFromLockFile();

    await client.getCredentials().then((respnse: any) => {
        userDetails = respnse.data;
    });

    const pdRequest: AxiosInstance = axios.create({
        baseURL: 'https://pd.na.a.pvp.net/',
        method: 'GET',
        headers: {
            'X-Riot-Entitlements-JWT': userDetails.entitlements,
            'X-Riot-ClientPlatform': 'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9',
            'Authorization': 'Bearer ' + userDetails.access_token,
            'X-Riot-ClientVersion': clientVersion
        }
    });

    getRanks(userDetails.puuid, pdRequest);

}

async function getRanks(puuid: string, requestBase: AxiosInstance) {
    var rankID: number = 0;
    var rank;
    var leaderboardPlace;
    await requestBase.get(`mmr/v1/players/${puuid}/competitiveupdates?startIndex=0&endIndex=1&queue=competitive`).then(response => {
        rankID = response.data.Matches[0].TierAfterUpdate;
        rank = ranks[rankID];
        console.log(response.data)
    });
    return {
        rank: rank,
        rankID: rankID
    };
}

export default main;