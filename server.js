const express = require('express');
const next = require('next');
const axios = require('axios');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

//
const http = require('http');
const socketIO = require('socket.io');
//



app.prepare().then(async () => {
    const server = express();
    const httpServer = http.createServer(server);

    const PORT = 3000;

    // Scheduler
    const runScheduler = async () => {
        try {
            _ = await axios.post(`http://localhost:${PORT}/api/budget/update`,
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            )

            _ = await axios.post(`http://localhost:${PORT}/api/transaction/auto/deleteFreeze`,
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            )
        } catch (error) {
            console.log(error)
        }
    }

    server.all('*', (req, res) => {
        return handle(req, res);
    });
    httpServer.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        runScheduler();
    });
});