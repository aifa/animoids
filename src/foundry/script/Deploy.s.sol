// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/hive/DfVideoScanner.sol";

contract Deploy is Script {
    function run() external {

        uint256 deployerPrivateKey =  vm.envUint("DEPLOYER_PRIVATE_KEY");
        DfVideoScanner dfVideoScanner =
            new DfVideoScanner(vm.addr(deployerPrivateKey));
        
        console.logString(
            string.concat(
                "DfVideoScanner deployed at: ", vm.toString(address(dfVideoScanner))
            )
        );
    }
}
