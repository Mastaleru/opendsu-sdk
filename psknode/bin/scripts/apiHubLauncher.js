const TAG = "API-HUB-LAUNCHER";

let path = require("path");

process.env.PSK_ROOT_INSTALATION_FOLDER = path.resolve(path.join(__dirname, "../../../"));
require(path.join(__dirname, '../../bundles/pskWebServer.js'));

path = require("swarmutils").path;
const API_HUB = require('apihub');
const fs = require('fs');

if (!process.env.PSK_ROOT_INSTALATION_FOLDER) {
    process.env.PSK_ROOT_INSTALATION_FOLDER = path.resolve("." + __dirname + "/../..");
}

if (!process.env.PSK_CONFIG_LOCATION) {
    process.env.PSK_CONFIG_LOCATION = "./conf";
}

function startServer() {
    let sslConfig = undefined;
    let config = API_HUB.getServerConfig();
    console.log(`[${TAG}] Using certificates from path`, path.resolve(config.sslFolder));

    try {
        sslConfig = {
            cert: fs.readFileSync(path.join(config.sslFolder, 'server.cert')),
            key: fs.readFileSync(path.join(config.sslFolder, 'server.key'))
        };
    } catch (e) {
        console.log(`[${TAG}] No certificates found, PskWebServer will start using HTTP`);
    }

    const listeningPort = Number.parseInt(config.port);
    const rootFolder = path.resolve(config.storage);

    const cluster  = require("cluster");
    const { availableParallelism } = require("os");
    const process = require("process");

    const numCPUs = 1 || availableParallelism();

    if (cluster.isPrimary) {
        console.log(`Primary ${process.pid} is running`);

        // Fork workers.
        for (let i = 0; i < numCPUs; i++) {
            console.log("Worker started");
            cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            console.log(`worker ${worker.process.pid} died`);
        });
    }else{
        API_HUB.createInstance(listeningPort, rootFolder, sslConfig, (err) => {
            if (err) {
                console.error(err);
                process.exit(err.errno || 1);
            }
            console.log(`\n[${TAG}] listening on port :${listeningPort} and ready to receive requests.\n`);
        });
    }
}

startServer();
