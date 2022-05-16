import {
	AccountId,
	PrivateKey,
	Client,
	FileCreateTransaction,
	ContractCreateTransaction,
	ContractFunctionParameters,
	ContractExecuteTransaction,
	ContractCallQuery,
	Hbar,
	TopicMessageSubmitTransaction,
	TransferTransaction,
	ContractInfoQuery,
	AccountBalanceQuery,
	TransactionRecordQuery,
} from "@hashgraph/sdk";

//configure accounts and client
const operatorId = AccountId.fromString(process.env.REACT_APP_MY_ACCOUNT_ID);
const operatorKey = PrivateKey.fromString(process.env.REACT_APP_MY_PRIVATE_KEY);
const treasuryId = AccountId.fromString(process.env.REACT_APP_MY_ACCOUNT_ID);
const treasuryKey = PrivateKey.fromString(process.env.REACT_APP_MY_PRIVATE_KEY);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

var contractId = process.env.REACT_APP_SMART_CONTRACT_ID ?? "";
const topicId = process.env.REACT_APP_HCS_TOPIC_ID;

//transfer hbar to vault
export async function executeFunction() {
	const contractExecuteTx = new TransferTransaction()
		.addHbarTransfer(treasuryId, -10)
		.addHbarTransfer(contractId, 10)
		.freezeWith(client);
	const contractExecuteSign = await contractExecuteTx.sign(treasuryKey);
	const contractExecuteSubmit = await contractExecuteSign.execute(client);
	const contractExecuteRx = await contractExecuteSubmit.getReceipt(client);
	console.log(`- Crypto transfer to contract: ${contractExecuteRx.status} \n`);
}

//version of executeFunction but takes in value
export async function deposit(amount) {
	let negative = 0 - amount;
	const contractExecuteTx = new TransferTransaction()
		.addHbarTransfer(treasuryId, negative)
		.addHbarTransfer(contractId, amount)
		.freezeWith(client);
	const contractExecuteSign = await contractExecuteTx.sign(treasuryKey);
	const contractExecuteSubmit = await contractExecuteSign.execute(client);
	const contractExecuteRx = await contractExecuteSubmit.getReceipt(client);
	console.log(`- Crypto transfer to contract: ${contractExecuteRx.status} \n`);
}

//sign transaction as caller
export async function signTransaction(){
	const contractQueryTx = new ContractExecuteTransaction()
		.setContractId(contractId)
		.setGas(100000)
		.setFunction("Sign");
	const contractQuerySubmit = await contractQueryTx.execute(client);
	console.log("signed");
}

//helper function to execute signed action
export async function doAction(){
	const contractQueryTx = new ContractExecuteTransaction()
		.setContractId(contractId)
		.setGas(100000)
		.setFunction("Action");
	const contractQuerySubmit = await contractQueryTx.execute(client);
	const msg = {
        message: "signature_required"
    }
	sendHCSMessage(JSON.stringify(msg));
	console.log(contractQuerySubmit);
	//show if failed add parse code
}

//check signature of indexed 
export async function checkSignature(index){
	const contractQueryTx = new ContractExecuteTransaction()
		.setContractId(contractId)
		.setGas(1000000)
		.setFunction("getSigned",
			new ContractFunctionParameters()
				.addUint256(index)
		);
	const contractQuerySubmit = await contractQueryTx.execute(client);
	console.log(contractQuerySubmit);
}

//add signer, takes address of signers
export async function addSigner(address){
	address = AccountId.fromString(address);
	const contractQueryTx = new ContractExecuteTransaction()
		.setContractId(contractId)
		.setGas(100000)
		.setFunction("addSigner",
			new ContractFunctionParameters()
				.addAddress(address.toSolidityAddress())
		);
	const contractQuerySubmit = await contractQueryTx.execute(client);
	console.log("added signer");
}

//withdraw funds to address
export async function withdraw(address){
	const contractQueryTx = new ContractExecuteTransaction()
		.setContractId(contractId)
		.setGas(100000)
		.setFunction("exWithdrawl",
			new ContractFunctionParameters()
				.addAddress(address.toSolidityAddress())
		);
	const contractQuerySubmit = await contractQueryTx.execute(client);
}

//return balance of smart contract aka vault
export async function contractQueryTx(){
	const contractQueryTx = new ContractCallQuery()
		.setContractId(contractId)
		.setGas(100000)
		.setFunction("getBalance");
	const contractQuerySubmit = await contractQueryTx.execute(client);
	const contractQueryResult = contractQuerySubmit.getUint256(0);
	console.log(`- Contract balance (from getBalance fcn): ${contractQueryResult} \n`);
	const cCheck = await new ContractInfoQuery().setContractId(contractId).execute(client);
	console.log(`- Contract balance (from ContractInfoQuery): ${cCheck.balance.toString()} \n`);
	return cCheck.balance.toString();
}

export async function createContract() {
	// const contractBytecode = fs.readFileSync(
	// 	"src/contracts/testContract.bin"
	// );
	const contractBytecode = process.env.REACT_APP_SMART_CONTRACT_BYTECODE;
	//"./contracts/simpleStepSafe_sol_stepSafe.bin"
	const fileCreateTx = new FileCreateTransaction()
		.setContents(contractBytecode)
		.setKeys([operatorKey])
		.freezeWith(client);
	const fileCreateSign = await fileCreateTx.sign(operatorKey);
	const fileCreateSubmit = await fileCreateSign.execute(client);
	const fileCreateRx = await fileCreateSubmit.getReceipt(client);
	const bytecodeFileId = fileCreateRx.fileId;
	console.log(`- The bytecode file ID is: ${bytecodeFileId} \n`);

	const contractInstantiateTx = new ContractCreateTransaction()
		.setBytecodeFileId(bytecodeFileId)
		.setGas(100000);
	const contractInstantiateSubmit = await contractInstantiateTx.execute(client);
	const contractInstantiateRx = await contractInstantiateSubmit.getReceipt(client);
	contractId = contractInstantiateRx.contractId;
	const contractAddress = contractId.toSolidityAddress();
	console.log(`- The smart contract ID is: ${contractId} \n`);
	console.log(`- The smart contract ID in Solidity format is: ${contractAddress} \n`);
}

//Helper function from hederaHCS.js
function sendHCSMessage(msg) {
    try {
        new TopicMessageSubmitTransaction()
            .setTopicId(topicId)
            .setMessage(msg)
            .execute(client);
        console.log(`- Sent HCS message: ${msg}`);
    } catch (error) {
        console.log("ERROR: TopicMessageSubmitTransaction()");
        process.exit(1);
    }
}