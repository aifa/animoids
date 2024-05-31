// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./interfaces/IOracle.sol";


contract VisionAgent {

    struct ChatRun {
        address owner;
        IOracle.Message[] messages;
        uint messagesCount;
    }

    mapping(uint => ChatRun) public chatRuns;
    uint private chatRunsCount;

    address private owner;
    address public oracleAddress;

    event OracleAddressUpdated(address indexed newOracleAddress);
    IOracle.OpenAiRequest private config;

       constructor(address initialOracleAddress) {
            owner = msg.sender;
            oracleAddress = initialOracleAddress;
            chatRunsCount = 0;

            config = IOracle.OpenAiRequest({
                model : "gpt-4o",
                frequencyPenalty : 21, // > 20 for null
                logitBias : "", // empty str for null
                maxTokens : 1000, // 0 for null
                presencePenalty : 21, // > 20 for null
                responseFormat : "{\"type\":\"text\"}",
                seed : 0, // null
                stop : "", // null
                temperature : 10, // Example temperature (scaled up, 10 means 1.0), > 20 means null
                topP : 101, // Percentage 0-100, > 100 means null
                tools : "",
                toolChoice : "", // "none" or "auto"
                user : "" // null
                });
        }

        modifier onlyOwner() {
            require(msg.sender == owner, "Caller is not owner");
            _;
        }

        modifier onlyOracle() {
            require(msg.sender == oracleAddress, "Caller is not oracle");
            _;
        }

        function setOracleAddress(address newOracleAddress) public onlyOwner {
            oracleAddress = newOracleAddress;
            emit OracleAddressUpdated(newOracleAddress);
        }

        function onOracleOpenAiLlmResponse(
        uint runId,
        IOracle.OpenAiResponse memory response,
        string memory errorMessage) 
        
        public onlyOracle {
            ChatRun storage run = chatRuns[runId];
            require(
                keccak256(abi.encodePacked(run.messages[run.messagesCount - 1].role)) == keccak256(abi.encodePacked("user")),
                "No message to respond to"
            );

            if (!compareStrings(errorMessage, "")) {
                IOracle.Message memory newMessage = IOracle.Message({
                    role: "assistant",
                    content: new IOracle.Content[](1)
                });
                newMessage.content[0].contentType = "text";
                newMessage.content[0].value = errorMessage;
                run.messages.push(newMessage);
                run.messagesCount++;
            } else {
                IOracle.Message memory newMessage = IOracle.Message({
                    role: "assistant",
                    content: new IOracle.Content[](1)
                });
                newMessage.content[0].contentType = "text";
                newMessage.content[0].value = response.content;
                run.messages.push(newMessage);
                run.messagesCount++;
            }
        }

    function compareStrings(string memory a, string memory b) private pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
}