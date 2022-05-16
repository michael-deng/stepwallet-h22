console.clear();
require("dotenv").config();
const {
	AccountId,
	PrivateKey,
	Client,
	FileCreateTransaction,
	ContractCreateTransaction,
	ContractFunctionParameters,
	ContractExecuteTransaction,
	ContractCallQuery,
	Hbar,
	TransferTransaction,
	ContractInfoQuery,
	AccountBalanceQuery,
	TransactionRecordQuery,
} = require("@hashgraph/sdk");
const fs = require("fs");

// Configure accounts and client
const operatorId = AccountId.fromString(process.env.REACT_APP_MY_ACCOUNT_ID);
const operatorKey = PrivateKey.fromString(process.env.REACT_APP_MY_PRIVATE_KEY);
const treasuryId = AccountId.fromString(process.env.REACT_APP_MY_ACCOUNT_ID);
const treasuryKey = PrivateKey.fromString(process.env.REACT_APP_MY_PRIVATE_KEY);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

var contractId = "";

async function deposit(amount) {
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

//sign transaction as user
async function signTransaction(){
	const contractQueryTx = new ContractExecuteTransaction()
		.setContractId(contractId)
		.setGas(100000)
		.setFunction("Sign");
	const contractQuerySubmit = await contractQueryTx.execute(client);
	console.log("signed");
}

//withdrawl funds to address
async function withdrawl(address){
	const contractQueryTx = new ContractExecuteTransaction()
		.setContractId(contractId)
		.setGas(100000)
		.setFunction("exWithdrawl",
			new ContractFunctionParameters()
				.addAddress(address.toSolidityAddress())
		);
	const contractQuerySubmit = await contractQueryTx.execute(client);
}

async function doAction(){
	const contractQueryTx = new ContractExecuteTransaction()
		.setContractId(contractId)
		.setGas(100000)
		.setFunction("Action");
	const contractQuerySubmit = await contractQueryTx.execute(client);
	//show if failed
}

//check signature of indexed 
async function checkSignature(index){
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
async function addSigner(address){
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

async function main() {
	const contractBytecode = fs.readFileSync(
		"./contracts/simpleStepSafe_sol_stepSafe.bin"
	);
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


async function test(){
	await main();
	await addSigner(operatorId);
	await checkSignature(0);
}

test();