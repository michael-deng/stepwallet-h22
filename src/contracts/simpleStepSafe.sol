// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
 
 contract stepSafe{

    address[] signersArray;

     mapping(address => bool) signed;

    //Returns amount of the safe
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    //add signer
    //currently does not block duplicate signers
    function addSigner(address signer) public {
        signersArray.push(signer);
    }

    //return signer array length
    function getLength() public view returns (uint) {
        return signersArray.length; 
    }

    //returns the address in the specified position of the array
    function getAddress(uint index) public view returns (address) {
        return signersArray[index]; 
    }

    // return if address has signed
    function getSigned(uint index) public view returns (bool) {
        return signed[signersArray[index]];
    }

    function Sign() public {
        require (msg.sender == signersArray[0] || msg.sender == signersArray[1]);
        require (!signed[msg.sender]);
        signed[msg.sender] = true;
    }

    function Action() public returns (string memory) {
        require (signed[signersArray[0]] && signed[signersArray[1]]);
        return "Action";
    }

    //example withdrawl function, not safe needs modifier
    function exWithdrawl(address payable withdrawlAddress) external {
        require (signed[signersArray[0]] && signed[signersArray[1]]);
        withdrawlAddress.transfer(address(this).balance);
    }
}