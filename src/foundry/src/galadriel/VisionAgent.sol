// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./interfaces/IOracle.sol";


contract VisionAgent {

    struct Chat {
        address owner;
        //IPFS cid that the chat maybe referring to
        string cid;
        uint messagesCount;
        IOracle.Message[] messages;
    }

    mapping(uint => Chat) public chatRequests;
    uint private requestsCount;

    address private owner;
    address private oracleAddress;

    event OracleAddressUpdated(address indexed newOracleAddress);
    event ChatCreated(address indexed owner, uint indexed chatId);

    IOracle.OpenAiRequest private config;

    constructor(address initialOracleAddress) {
            owner = msg.sender;
            oracleAddress = initialOracleAddress;
            requestsCount = 0;

            config = IOracle.OpenAiRequest({
                model : "gpt-4-turbo",
                frequencyPenalty : 0, // > 20 for null
                logitBias : "", // empty str for null
                maxTokens : 1500, // 0 for null
                presencePenalty : 0, // > 20 for null
                responseFormat : "{\"type\":\"text\"}",
                seed : 0, // null
                stop : "", // null
                temperature : 5, // Example temperature (scaled up, 10 means 1.0), > 20 means null
                topP : 100, // Percentage 0-100, > 100 means null
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

    function getOracleAddress() public view returns (address) {
        return oracleAddress;
    }

    function submitSingleImageRequest(string memory message, string memory imageUrl, string memory cid) public returns (uint i) {
        Chat storage run = chatRequests[requestsCount];

        run.owner = msg.sender;
        run.cid = cid;
        IOracle.Message memory newMessage = IOracle.Message({
            role: "user",
            content: new IOracle.Content[](1)
        });
        newMessage.content[0] = IOracle.Content({
            contentType: "text",
            value: message
        });

        newMessage.content[0] = IOracle.Content({
            contentType: "image_url",
            value: imageUrl
        });

        run.messages.push(newMessage);
        run.messagesCount = 1;

        uint currentId = requestsCount;
        requestsCount = requestsCount + 1;

        IOracle(oracleAddress).createOpenAiLlmCall(currentId, config);
        emit ChatCreated(msg.sender, currentId);

        return currentId;
    }

    function submitRequest(string memory message, string[] memory imageUrls, string memory cid) public returns (uint i) {
        Chat storage run = chatRequests[requestsCount];

        run.owner = msg.sender;
        run.cid = cid;
        IOracle.Message memory newMessage = IOracle.Message({
            role: "user",
            content: new IOracle.Content[](imageUrls.length + 1)
        });
        newMessage.content[0] = IOracle.Content({
            contentType: "text",
            value: message
        });
        for (uint u = 0; u < imageUrls.length; u++) {
            newMessage.content[u + 1] = IOracle.Content({
                contentType: "image_url",
                value: imageUrls[u]
            });
        }
        run.messages.push(newMessage);
        run.messagesCount = 1;

        uint currentId = requestsCount;
        requestsCount = requestsCount + 1;

        IOracle(oracleAddress).createOpenAiLlmCall(currentId, config);
        emit ChatCreated(msg.sender, currentId);

        return currentId;
    }

    function onOracleOpenAiLlmResponse(
        uint requestId,
        IOracle.OpenAiResponse memory response,
        string memory errorMessage) 
        public onlyOracle {
            Chat storage run = chatRequests[requestId];
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

    function getRequestHistory(uint requestId) public view returns (IOracle.Message[] memory) {
        return chatRequests[requestId].messages;
    }
    
    function getConfig() public view returns (IOracle.OpenAiRequest memory) {
        return config;
    }

    function compareStrings(string memory a, string memory b) private pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
}