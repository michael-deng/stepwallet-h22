/* configure access to .env */
require("dotenv").config();
const TextDecoder = require("text-encoding").TextDecoder;

/* hedera.js */
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

let operatorAccount = '0.0.34729660';
let operatorKey = '302e020100300506032b657004220420fed7e821fa77e1eb2121c08504f1527717135dd9375f77731e0d0b96dac6a5f0';
const hederaClient = Client.forTestnet();
let topicId = "";
let logStatus = "Default";
const log = require("./utils.js").handleLog;
const fs = require("fs");

let latestMessage = "";


// Add vault to HCS topic managing vaults
function addVault(msg) {
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

