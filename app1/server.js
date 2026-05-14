const express = require('express');
const { createClient } = require('redis');

const app = express();
app.use(express.urlencoded({ extended: true }));

const client = createClient({
    url: 'redis://redis:6379'
});

client.on('error', (err) => console.log('Redis Client Error', err));

app.get('/', async (req, res) => {
    await client.connect();
    
    // Connect to the shared Redis container using Docker DNS
    await client.incr('page_visits');
    await client.disconnect();
    
    // Check if the success parameter is in the URL
    const successMessage = req.query.success ? '<p style="color: green; font-weight: bold;">Message sent successfully!</p>' : '';
    
    res.send(`
        <html>
            <body style="font-family: sans-serif; padding: 2rem;">
                <h2>DevOpsHub Feedback Form</h2>
                ${successMessage}
                <form action="/submit" method="POST">
                    <textarea name="message" required placeholder="Enter your feedback here..." rows="4" cols="50"></textarea>
                    <br><br>
                    <button type="submit">Submit Message</button>
                </form>
            </body>
        </html>
    `);
});

app.post('/submit', async (req, res) => {
    const message = req.body.message;
    await client.connect();
    
    // Push submitted messages to the Redis list
    await client.lPush('messages_list', message);
    await client.disconnect();
    
    // Redirect back to the main page with a success flag
    res.redirect('/?success=true');
});

app.listen(3000, () => {
    console.log('App 1 running on port 3000');
});