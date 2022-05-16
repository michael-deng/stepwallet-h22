import React, { useEffect, useState } from "react";
import "./App.css";
import { useHashConnect } from "./HashConnectAPIProvider";
import { Routes, Route, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { executeFunction, deposit, signTransaction, doAction, checkSignature, addSigner, withdraw, contractQueryTx, createContract } from "./hederaSmartContract.js";
import {
  AccountId,
  PrivateKey,
  Client,
  TopicCreateTransaction,
  TopicMessageQuery,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";

function App() {
  return (
    <div className="app">
      <h2>Stepwallet is a Hedera vault secured by your social graph</h2>
      <big>Enhance security by requiring trusted friends or family members to approve your Hedera transactions</big>
      <br /><br /><br />
      <Routes>
        <Route path="/" element={<ConnectWallet />} />
        <Route path="createvault" element={<CreateVault />} />
        <Route path="config" element={<ConfigSigners />} />
        <Route path="vaults" element={<Vaults />} />
        <Route path="vault" element={<Vault />} />
      </Routes>
    </div>
  );
}

export default App;

function ConnectWallet() {
  const { connect, walletData, installedExtensions, clearSaveData } = useHashConnect();
  const { accountIds, netWork, id } = walletData;
  const conCatAccounts = (lastAccs: string, Acc: string) => {
    return lastAccs + " " + Acc;
  };

  const handleConnect = () => {
    if (installedExtensions) connect();
    else
      alert(
        "Please install hashconnect wallet extension first. from chrome web store."
      );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(walletData.pairingString);
  };

  const handleClear = () => {
    clearSaveData();
  }

  return (
    <div className="block">
      <h3>Connect to HashPack</h3>
      <p>Connect your wallet in order to create or load your vault.</p>

      <div className="formrow">
        {accountIds && accountIds?.length > 0 && (
          <div>
            <p><b>Connected:</b> {accountIds.reduce(conCatAccounts)} <a className="link" href="/createvault">Continue</a></p>
          </div>
        )}
      </div>

      <div className="buttonrow">
        <button onClick={handleConnect}>Connect to wallet</button>
        <button onClick={handleCopy}>Copy pairing string</button>
        <button onClick={handleClear}>Clear connections</button>
      </div>
    </div>
  );
}

function CreateVault() {
  const [creating, setCreating] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const createVault = async () => {
    setLoading(false);
    setCreating(true);
    await createContract();
    window.location.href = "/config";
  }

  const loadVault = async () => {
    setCreating(false);
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    window.location.href = "/vaults";
  }

  return (
    <div className="block">
      <h3>Create new vault</h3>
      <p>Create a new vault where you can configure transactions to require approval from trusted parties.</p>

      <div className="formrow">
        {creating && <div className="pending">Creating vault...</div>}
        {loading && <div className="pending">Loading vault...</div>}
      </div>

      <div className="buttonrow">
        <button onClick={createVault}>Create vault</button>
        <button onClick={loadVault}>Load existing vault</button>
      </div>
    </div>
  );
}

function ConfigSigners() {
  const { register, handleSubmit } = useForm();

  const configSubmit = (data:any) => {
    // Todo
  }

  return (
    <div className="block">
      <h3>Configure number of approvals required</h3>
      <p>E.g. Require 2 out of 3 approvers to sign for your transaction to succeed.</p>

      <div className="formrow">
        <form onSubmit={handleSubmit(configSubmit)}>
          <input placeholder="Min # of signatures" {...register("Signers")} />
          <input placeholder="Total # of signatures" {...register("numSignatures")} />
          <input type="submit" />
        </form>
      </div>

      <div className="buttonrow">
        <Link to="/createvault">
          <button>Go back</button>
        </Link>
        <Link to="/vaults">
          <button>Complete</button>
        </Link>
      </div>
    </div>
  );
}

function Vaults() {
  return (
    <div className="block">
      <h2>Stepwallet Vault</h2>
      <p><b>Address:</b> {process.env.REACT_APP_SMART_CONTRACT_ID}</p>
      <div className="buttonrow">
        <Link to="/vault">
          <button>Enter vault</button>
        </Link>
      </div>
    </div>
  );
}

function Vault() {
  const [showTransferForm, setShowTransferForm] = useState<boolean>(false);
  const [balance, setBalance] = useState<string>("");
  const [showAddApproverForm, setShowAddApproverForm] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [pending2, setPending2] = useState<boolean>(false);
  const [success2, setSuccess2] = useState<boolean>(false);
  const { register, handleSubmit } = useForm();

  const transfer = () => {
    setSuccess(false);
    setPending(false);
    setBalance("");
    setShowTransferForm(true);
  }

  const transferSubmit = handleSubmit(async (data) => {
    setSuccess(false);
    setPending(true);
    await deposit(data.Amount);
    setPending(false);
    setSuccess(true);
  })

  const withdrawFromVault = async () => {
    setSuccess(false);
    setPending(true);
    setShowTransferForm(false);
    setBalance("");
    await doAction();
    setPending(false);
  }

  const getBalance = async () => {
    setSuccess(false);
    setPending(true);
    var balance = await contractQueryTx();
    setPending(false);
    setSuccess(true);
    setShowTransferForm(false);
    setBalance(balance);
  }

  const addApprover = () => {
    setSuccess2(false);
    setPending2(false);
    setShowAddApproverForm(true);
  }

  const addApproverSubmit = handleSubmit(async (data) => {
    setSuccess2(false);
    setPending2(true);
    await addSigner(data.Address);
    setPending2(false);
    setSuccess2(true);
  })

  const sign = async () => {
    setSuccess2(false);
    setPending2(true);
    setShowAddApproverForm(false);
    await signTransaction();
    setPending2(false);
    setSuccess2(true);
  }

  return (
    <div>
      <h3>Vault {process.env.REACT_APP_SMART_CONTRACT_ID}</h3>
      <div className="block">
        <h3>Transactions</h3>
        <p>Transfer HBAR to or from your vault or check your balance.</p>

        <div className="formrow">
          {
            showTransferForm && <form onSubmit={transferSubmit}>
              <input type="number" placeholder="Transfer amount" {...register("Amount")} />
              <input type="submit" />
            </form>
          }

          {balance && <div>Current balance: {balance}</div>}

          {pending && <div className="pending">Pending</div>}
          {success && <div className="success">Success!</div>}
        </div>

        <div className="buttonrow">
          <button onClick={transfer}>Transfer to vault</button>
          <button onClick={withdrawFromVault}>Withdraw all</button>
          <button onClick={getBalance}>Show balance</button>
        </div>
      </div>
      <div className="block">
        <h3>Approvers</h3>
        <p>Manage your approvers. Don't forget to add yourself as an approver!</p>

        <div className="formrow">
          {
            showAddApproverForm && <form onSubmit={addApproverSubmit}>
              <input type="string" placeholder="Hedera account ID" {...register("Address")} />
              <input type="submit" />
            </form>
          }

          {pending2 && <div className="pending">Pending</div>}
          {success2 && <div className="success">Success!</div>}
        </div>

        <div className="buttonrow">
          <button onClick={addApprover}>Add approver</button>
          <button onClick={sign}>Sign transaction</button>
        </div>
      </div>
    </div>
  );
}