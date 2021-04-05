import {OAuth2Client} from "google-auth-library";

async function verify(token){
    const client = new OAuth2Client(token);
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: "158823134681-98bgkangoltk636ukf8pofeis7pa7jbk.apps.googleusercontent.com"
    });
    const payload = ticket.getPayload();
    const userId = payload['sub'];

    return {
        userId : payload['sub'],
        userName : payload['name']
    };
}

export default verify;