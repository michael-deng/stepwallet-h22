// configure access to .env
require("dotenv").config();
const TextDecoder = require("text-encoding").TextDecoder;

// hedera.js
const {
    AccountId,
    Client,
    TopicId,
    ContractCreateTransaction,
    ContractFunctionParameters,
    ContractExecuteTransaction,
    ContractCallQuery,
    Hbar,
    TopicMessageSubmitTransaction,
    TopicCreateTransaction,
    TopicMessageQuery
} = require("@hashgraph/sdk");

let operatorAccount = process.env.REACT_APP_MY_ACCOUNT_ID;
let operatorKey = process.env.REACT_APP_MY_PRIVATE_KEY;
const hederaClient = Client.forTestnet();
let topicId = "";
let logStatus = "Default";
const log = require("./utils.js").handleLog;
const fs = require("fs");
const http = require('http');
const host = 'localhost';
const port = 8000;
let latestMessage = "";

// create HCS topic
async function createNewTopic() {
    try {
        const response = await new TopicCreateTransaction().execute(hederaClient);
        log("TopicCreateTransaction()", `submitted tx`, logStatus);
        const receipt = await response.getReceipt(hederaClient);
        const newTopicId = receipt.topicId;
        log(
            "TopicCreateTransaction()",
            `Created new topic at ${newTopicId}`,
            logStatus
        );
        return newTopicId;
    } catch (error) {
        log("ERROR: TopicCreateTransaction()", error, logStatus);
        process.exit(1);
    }
}

// send HCS msg
function sendHCSMessage(msg) {
    try {
        new TopicMessageSubmitTransaction()
            .setTopicId(topicId)
            .setMessage(msg)
            .execute(hederaClient);
        log("TopicMessageSubmitTransaction()", msg, logStatus);
    } catch (error) {
        log("ERROR: TopicMessageSubmitTransaction()", error, logStatus);
        process.exit(1);
    }
}

// subscribe to a topic and receive messages
function subscribe() {
    try {
        new TopicMessageQuery()
            .setTopicId(topicId)
            .subscribe(hederaClient,
                (error) => {
                    log("Error", error, logStatus);
                },
                (message) => {
                    log("Response from TopicMessageQuery()", message, logStatus);
                    const mirrorMessage = new TextDecoder("utf-8").decode(message.contents);
                    const messageJson = JSON.parse(mirrorMessage);
                    log("Parsed message", logStatus);

                    const messageOut = {
                        operatorAccount: messageJson.operatorAccount,
                        client: messageJson.client,
                        message: messageJson.message,
                        time: Date.now(),
                    }
                    //need code to send messageOut
                    const messageOutString = JSON.stringify(messageOut)
                    console.log(messageOutString);

                    latestMessage = messageOutString;
                }
            );
        log("MirrorConsensusTopicQuery()", topicId.toString(), logStatus);
    } catch (error) {
        log("ERROR: MirrorConsensusTopicQuery()", error, logStatus);
        process.exit(1);
    }
}

async function main() {
    hederaClient.setOperator(operatorAccount, operatorKey);
    topicId = process.env.REACT_APP_HCS_TOPIC_ID;
    subscribe();
}
main();

// create http server
const requestListener = function (req, res) {
    res.setHeader("Content-Type", "application/json");
    res.writeHead(200);
    res.end(latestMessage);
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});