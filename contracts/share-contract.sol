// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0; 

contract Token {
    string public name;
    string public symbol;
    uint8 public decimals = 18;

    uint256 public totalSupply; 

    mapping (address => uint256) public balanceOf; 
    mapping (address => mapping (address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory tokenName, string memory tokenSymbol, uint256 initialSupply) {
        name = tokenName;
        symbol = tokenSymbol;
        totalSupply = initialSupply;
        balanceOf[msg.sender] = initialSupply;
        emit Transfer(address(0), msg.sender, initialSupply);
    }

    // I went ahead and tried to write the transer function
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value; 
        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= allowance[_from][msg.sender], "Insufficient allowance!");
        require (_value <= balanceOf[_from], "Insufficient owner balance!");
        allowance[_from][msg.sender] -= _value;

        balanceOf[_from] -= _value;    
        balanceOf[_to] += _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    function _mint(address account, uint256 amount) internal {
        totalSupply += amount; 
        balanceOf[account] +=  amount;
    }

    function _burn(address account, uint256 amount) internal {
        totalSupply -= amount; 
        balanceOf[account] -= amount;
    }
}