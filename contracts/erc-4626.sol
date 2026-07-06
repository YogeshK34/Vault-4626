// SPDX-License-Identifier:MIT
pragma solidity ^0.8.0; 

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

import "./share-contract.sol";

contract ERC4626 is Token {
    event Deposit(
        address indexed sender,
        address indexed owner,
        uint256 assets,
        uint256 shares
    );

    event Withdraw(
        address indexed sender,
        address indexed receiver,
        address indexed owner,
        uint256 assets,
        uint256 shares
    );

    address public assetAddress = 0x109916Bcc350C331c48Bef12D6ADA1a640758E64; // this is an already existing erc-20 token contract, I have performed interction with this one

    constructor(string memory _name, string memory _symbol, uint256 _initialSupply) 
    Token(_name,_symbol, _initialSupply) {
    }

    // I can actually skip this as assetAddress is public, I'll have a getter function
    function asset() public view returns (address) {
        return assetAddress; // this would return 0x109916Bcc350C331c48Bef12D6ADA1a640758E64
    } 

    function totalAssets() public view returns (uint256) {
        return IERC20(assetAddress).balanceOf(address(this));
    }

    function convertToShares(uint256 assets) public view returns (uint256 shares) {
        if (totalSupply == 0) {
            return shares = assets;
        } else {
            return shares = assets * totalSupply / totalAssets();
        }       
    }

    function convertToAssets(uint256 shares) public view returns (uint256 assets) {
        if (totalSupply == 0) {
            return assets = shares;
        } else {
            return assets = shares * totalAssets() / totalSupply;
        }
    }

    function maxDeposit() public pure returns (uint256 maxAssets) {
        return maxAssets = type(uint256).max;
    }

    function previewDeposit(uint256 assets) public view returns (uint256 shares) {
        return convertToShares(assets);
    }

    function deposit(uint256 assets, address receiver) public returns (uint256 shares) {
        IERC20(assetAddress).transferFrom(msg.sender, address(this), assets);
        uint256 sharesCalculated = convertToShares(assets);
        _mint(receiver, sharesCalculated);

        emit Deposit(msg.sender, receiver,assets, sharesCalculated);
        return sharesCalculated;
    }

    function maxMint() public pure returns (uint256 maxShares) {
        return maxShares = type(uint256).max;
    }

    function previewMint(uint256 shares) public view returns (uint256 assets) {
        return convertToAssets(shares);
    }

    function mint(uint256 shares, address receiver) public returns (uint256 assets) {
        uint256 assetsFound = convertToAssets(shares);
        IERC20(assetAddress).transferFrom(msg.sender, address(this), assetsFound);
        _mint(receiver, shares);

        emit Deposit(msg.sender, receiver, assetsFound, shares);
        return assetsFound;
    }

    function maxWithdraw() public pure returns (uint256 maxAssets) {
        return maxAssets = type(uint256).max;
    }

    function previewWithdraw(uint256 assets) public view returns (uint256 shares) {
        return convertToShares(assets);
    }

    function withdraw(uint256 assets, address receiver, address owner) public returns (uint256 shares) {
        uint256 totalShares = convertToShares(assets);
        if (msg.sender != owner) {
            require(totalShares <= allowance[owner][msg.sender], "Insufficient allowance!");
            allowance[owner][msg.sender] -= totalShares;
        }

        uint256 ownerMaxAssets = convertToAssets(balanceOf[owner]);
        require(assets <= ownerMaxAssets, "Incorrect input, enter correct asset value!");

        _burn(owner, totalShares);
        IERC20(assetAddress).transfer(receiver, assets);

        emit Withdraw(msg.sender, receiver, owner, assets, totalShares);
        return totalShares;
    }

    function maxRedeem() public pure returns (uint256 maxShares) {
        return maxShares = type(uint256).max;
    }

    function previewRedeem(uint256 shares) public view returns (uint256 assets) {
        return convertToAssets(shares);
    }

    function redeem(uint256 shares, address receiver, address owner) public returns (uint256 assets) {
        uint256 maxOwnerShare = balanceOf[owner]; 

        if (msg.sender != owner) {
            require(shares <= allowance[owner][msg.sender], "Insufficient Allowance!");
            allowance[owner][msg.sender] -= shares;
        }

        require(shares <= maxOwnerShare, "Incorrect input, enter correct shares owned!");

        uint256 maxOwnerAsset = convertToAssets(shares);

        _burn(owner, shares);
        IERC20(assetAddress).transfer(receiver, maxOwnerAsset);

        emit Withdraw(msg.sender, receiver, owner, maxOwnerAsset, shares);
        return maxOwnerAsset;
    }
}