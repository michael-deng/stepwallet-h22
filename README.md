<h1>Stepwallet</h1>

Stepwallet is a Hedera vault secured by your social graph. It allows you to require multiple signatures for Hedera transactions on the smart contract level, which grants much greater flexibility.

<b>This is a fresh repo with environment variables and private credentials removed, for submission to the Hedera22 Hackathon.</b>

<h2>dApp</h2>

<b>Directory overview:</b>

- Almost everything lives in the `stepwallet/src` directory
- `App.tsx` and `index.tsx` contain the client-side react code
- `HashConnectAPIProvider.tsx` contains the client-side hashconnect code, derived from https://github.com/rajatK012/hashconnectWalletConnect
- `hederaSmartContract.js` contains vault functions such as creating the vault smart contract, sending transactions, transferring HBAR, and checking balance
- `hederaHCS.js` contains HCS functions such as creating a topic, subscribing to a topic, and receiving messages
- `contracts` contain the smart contracts that power Stepwallet

<b>To install dependencies:</b> `yarn install`

<b>To start localhost:</b> `yarn start`

<b>To enable creating a HCS topic to publish messages:</b>

Go to https://portal.hedera.com/ and copy your account id and private key into `stepwallet/.env`:
```
REACT_APP_MY_ACCOUNT_ID=your account id
REACT_APP_MY_PRIVATE_KEY=your private key
```

<b>To connect to wallet and send transactions, have to use https:</b>

1. Install mkcert `brew install mkcert`
2. `mkcert -install`
3. `mkcert localhost`
4. Add the following into `stepwallet/.env`:
```
HTTPS=true
SSL_CRT_FILE=localhost.pem
SSL_KEY_FILE=localhost-key.pem
```
3. Go to <b>chrome://flags/#allow-insecure-localhost</b> and allow invalid certificates for resources loaded from localhost

<b>To expose the HCS server to the internet:</b>

1. `node src/hederaHCS.js`
2. `ngrok http 8000` in a separate terminal window

<h2>Chrome extension</h2>

<b>Directory overview:</b>

- Everything lives in the `stepwallet/extension` directory
- `background.js` contains logic for fetching HCS messages and updating the chrome extension icon
- `popup.js` contains logic for the chrome extension UI

<b>To install in chrome:</b>

1. Go to <b>chrome://extensions/</b>
2. `Load unpacked` -> select the `extension` directory in `stepwallet`
