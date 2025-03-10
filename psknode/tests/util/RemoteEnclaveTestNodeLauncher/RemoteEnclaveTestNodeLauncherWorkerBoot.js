require("../../../../psknode/bundles/testsRuntime");

const Logger = require("../Logger");

const logger = new Logger("[RemoteEnclaveNodeLauncherWorkerBoot]");
async function boot() {

    try {
        const remoteEnclave = require("remote-enclave");

        let remoteEnclaveInstance;
        const remoteEnclaveInitialised = new Promise((resolve, reject) => {
            const callback = (result) => {
                resolve(result);
            };
            remoteEnclaveInstance = remoteEnclave.createInstance(JSON.parse(process.env.REMOTE_ENCLAVE_CONFIG));
            remoteEnclaveInstance.start();
            remoteEnclaveInstance.on("initialised", callback);
        });

        const remoteEnclaveDID = await remoteEnclaveInitialised;

        process.stdout.write("DID:" + remoteEnclaveDID);
    } catch (error) {
        logger.error("Boot error", error);
    }

    process.on("uncaughtException", (error) => {
        logger.error("uncaughtException inside node worker", error);
        setTimeout(() => process.exit(1), 100);
    });
}

boot();

module.exports = boot;