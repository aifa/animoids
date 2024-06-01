import {Contract, ethers, TransactionReceipt, Wallet} from "ethers";
import VisionAgentABI from "./abis/VisionAgent.json";
import * as readline from 'readline';

interface Message {
    role: string,
    content: string,
}

export const submitAgentRequest = async (cid:string, url:string, prompt: string) : Promise<string> => {
    
    const privateKey = process.env.NEXT_GALADRIEL_KEY;
    if (!privateKey) throw Error("Missing PRIVATE_KEY in .env")
    const rpcUrl = process.env.NEXT_GALADRIEL_URL;
    if (!rpcUrl) throw Error("Missing RPC_URL in .env")
    const contractAddress = process.env.NEXT_VISION_AGENT_CONTRACT_ADDRESS;
    if (!contractAddress) throw Error("Missing CONTRACT_ADDRESS in .env")

    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const wallet = new Wallet( privateKey, provider);
    const contract = new Contract(contractAddress, VisionAgentABI.abi, wallet)
    
    const promptString:string = prompt;
    const urlString:string = url;
    const cidString:string = cid;
    const transactionResponse = await contract.submitSingleImageRequest(promptString, urlString, cidString);
    
    const receipt = await transactionResponse.wait()
    console.log(`submitted job: ${receipt.hash}`)
    // Get the chat ID from transaction receipt logs
    let chatId = getChatId(receipt, contract);
    console.log(`Created chat ID: ${chatId}`)

    if (!chatId && chatId !== 0) {
        return "Error: Could not get chat ID from transaction receipt logs"
    }

    let allMessages: Message[] = []
  // Run the chat loop: read messages and send messages
    while (true) {
        const newMessages: Message[] = await getNewMessages(contract, chatId, allMessages.length);
        if (newMessages) {
            for (let message of newMessages) {
                    console.log(`${message.role}: ${message.content}`)
                    if (message.role === "assistant") {
                        return message.content
                    }
                }
            }
        await new Promise(resolve => setTimeout(resolve, 2000))
    }
}

async function getNewMessages(
    contract: Contract,
    chatId: number,
    currentMessagesCount: number
  ): Promise<Message[]> {
    const messages = await contract.getRequestHistory(chatId)
  
    const newMessages: Message[] = []
    messages.forEach((message: any, i: number) => {
      if (i >= currentMessagesCount) {
        newMessages.push(
          {
            role: message[0],
            content: message[1][0][1],
          }
        );
      }
    })
    return newMessages;
  }

function getChatId(receipt: TransactionReceipt, contract: Contract) {
    let chatId
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log)
        if (parsedLog && parsedLog.name === "ChatCreated") {
          // Second event argument
          chatId = ethers.toNumber(parsedLog.args[1])
        }
      } catch (error) {
        // This log might not have been from your contract, or it might be an anonymous log
        console.log("Could not parse log:", log)
      }
    }
    return chatId;
  }