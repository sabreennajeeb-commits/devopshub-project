const express = require('express');
const { createClient } = require('redis');

const app = express();

const client = createClient({
    url: 'redis://redis:6379'
});

client.on('error', (err) => console.log('Redis Client Error', err));

app.get('/', async (req, res) => {
    await client.connect();
    // Fetch the current page visits and message count from Redis
    const visits = await client.get('page_visits') || 0;
    const messageCount = await client.lLen('messages_list') || 0;
    await client.disconnect();
    // Render the simple HTML dashboard
    res.send(`
        <html>
            <body style="font-family: sans-serif; padding: 2rem; background-color: #f4f4f9;">
                <h2>DevOpsHub Dashboard</h2>
                <div style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); width: 300px;">
                    <p><strong>Total Messages Collected:</strong> ${messageCount}</p>
                    <p><strong>Total Page Visits:</strong> ${visits}</p>
                </div>
            </body>
        </html>
    `);
});

app.listen(3000, () => {
    console.log('App 2 running on port 3000');
});