const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// Your Discord application details
const clientId = '1202779676733607976';
const clientSecret = 'Ft1bgEwnNucwMJpPhRBcqpMAJ4I-cQW4';
const redirectUri = 'http://localhost:3000/Authentication';

// Route for initiating the Discord OAuth2 flow
app.get('/connect', (req, res) => {
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify`;
    console.log(`Redirecting to Discord authorization: ${discordAuthUrl}`);
    res.redirect(discordAuthUrl);
});

// Route to handle the Discord callback and retrieve user ID
app.get('/Authentication', async (req, res) => {
    try {
        const code = req.query.code;
        console.log(`Received authorization code: ${code}`);

        // Exchange the authorization code for an access token
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', {
            grant_type: 'authorization_code',
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
            redirect_uri: redirectUri,
            scope: 'identify'
        });
        console.log('Token response:', tokenResponse.data);

        const accessToken = tokenResponse.data.access_token;

        // Use the access token to fetch user information
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        console.log('User response:', userResponse.data);

        const userId = userResponse.data.id;

        // Log the user ID
        console.log(`Authorized user ID: ${userId}`);

        // Return the user ID in the response
        res.send(`Authorized user ID: ${userId}`);
    } catch (error) {
        console.error('Error during authentication:', error);
        res.status(500).send('Error during authentication.');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
