const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const provider = new HDWalletProvider(
    'YOUR MNEMONIC',
    'https://rinkeby.infura.io/v3/b93bfc5f4dc9412bb5467ed7a55b8f1b'
);

const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy as account: ', accounts[0]);
    
    const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy( { data: bytecode, arguments: ['Hi There!'] })
    .send( {gas: '1000000', from: accounts[0]});

    console.log("Contract deployed to ", result.options.address)
};

deploy();

//Attempting to deploy as account:  0x5E1fe1a5e45489A728a7226eA375C11F3deC14bE
//Contract deployed to  0xF9Cf179f9A1e619c944A44Ade8B6E69b8F595cD5