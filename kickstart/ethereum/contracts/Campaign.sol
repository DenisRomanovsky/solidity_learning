pragma solidity ^0.4.17;

//Campaign Factry contract
contract CampaignFactory{
    address[] public deployedCampaigns;
    
    function createCampaign(uint minimum) public {
        address newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(newCampaign);
    }
    
    function getDeployedCampaigns() public view returns(address[]) {
        return deployedCampaigns;
    }
}
contract Campaign {
    //Structs
    struct Request{
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
    }
    
    // Storage
    Request[] public requests;
    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public approvers;
    uint approversCount;
    
    //Constructor
    function Campaign(uint minimum, address owner) public {
        manager = owner;
        minimumContribution = minimum;
    }
    
    //Modifiers
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
    
    //Functions
    function contribute() public payable {
        require(msg.value > minimumContribution);
        
        approvers[msg.sender] = true;
        approversCount++;
    }
    
    function createRequest(string description, uint value, address recipient) 
        public restricted {
        Request memory newRequest = Request({
            description: description,
            value: value,
            recipient: recipient,
            complete: false,
            approvalCount: 0
        });
        
        requests.push(newRequest);
    }
    
    function approveRequest(uint index) public {
        Request storage request = requests[index];
        
        require(approvers[msg.sender]);
        require(!request.approvals[msg.sender]); // No votes before.
        
        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }
    
     function finalizeRequest(uint index) public restricted {
         Request storage request = requests[index];
         
         require(!request.complete);
         require(request.approvalCount >= (approversCount / 2));
         
         request.recipient.transfer(request.value);
         request.complete = true;
     }
}