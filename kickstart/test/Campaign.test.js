const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory= require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');
const { request } = require('http');

let accounts;
let factory;
let campaignAddress;
let Campaign;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy( {data: compiledFactory.bytecode})
        .send({from: accounts[0], gas: '1000000'});

        await factory.methods.createCampaign('100').send({from: accounts[0], gas: '1000000'});

        [campaignAddress] = await factory.methods.getDeployedCampaigns().call();
        campaign = await new web3.eth.Contract(
            JSON.parse(compiledCampaign.interface),
            campaignAddress
        );
})

describe('Campaign', () => {
    it('Deploys a factory and a campaign', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });

    it('marks caller as an admin', async () => {
        const manager = await campaign.methods.manager().call();
        assert.equal(manager, accounts[0]);
    });

    it('allows users to donate', async ()=> {
        await campaign.methods.contribute().send(
            {
                value: '101',
                from: accounts[1]
            }
        );

        const isContributor = await campaign.methods.approvers(accounts[1]).call();
        assert(isContributor);
    });

    it('allows only minimal value', async ()=> {
        try{
            await campaign.methods.contribute().send(
                {
                    value: '99',
                    from: accounts[1]
                }
            )
            assert(false);
        } catch(err) {
            assert(err);
        }
    });

    it('allows manager to create a payment request', async () => {
        await campaign.methods.createRequest(
            'Buy batteries',
            '1000',
            accounts[1]
        ).send({from: accounts[0], gas: '1000000'});

        const request = await campaign.methods.requests(0).call();
        assert.equal('Buy batteries', request.description);
    })

    it('e2e test', async ()=>{
        await campaign.methods.contribute().send(
            {
                value: web3.utils.toWei('10', 'ether'),
                from: accounts[0]
            }
        );

        await campaign.methods.createRequest(
            'A',
            web3.utils.toWei('5', 'ether'),
            accounts[1]
        ).send({from: accounts[0], gas: '1000000'});

        await campaign.methods.approveRequest(0).send(
            {
                from: accounts[0],
                gas: '1000000'
            }
        );

        await campaign.methods.finalizeRequest(0).send(
            {
                from: accounts[0],
                gas: '1000000'
            }
        );

        let balance = await web3.eth.getBalance(accounts[1]);
        balance = web3.utils.fromWei(balance, 'ether');
        balance = parseFloat(balance);

        assert(balance > 104)
    })
})