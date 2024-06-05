'use server'
import {Contract, ethers, TransactionReceipt, Wallet} from "ethers";
import OpenAiChatGptVision from "./abis/OpenAiChatGptVision.json";

interface Message {
    role: string,
    content: string,
}

export const submitAgentRequest = async (url:string, prompt: string) : Promise<string> => {
    const privateKey = process.env.NEXT_GALADRIEL_KEY;
    if (!privateKey) throw Error("Missing PRIVATE_KEY in .env")
    const rpcUrl = process.env.NEXT_GALADRIEL_URL;
    if (!rpcUrl) throw Error("Missing RPC_URL in .env")
    const contractAddress = process.env.NEXT_OPENAI_VISION_AGENT_CONTRACT_ADDRESS;
    if (!contractAddress) throw Error("Missing NEXT_OPENAI_VISION_AGENT_CONTRACT_ADDRESS in .env")

      const provider = new ethers.JsonRpcProvider(rpcUrl)
      const wallet = new Wallet(
        privateKey, provider
      )
      const contract = new Contract(contractAddress, OpenAiChatGptVision.abi, wallet)
    
      // The message you want to start the chat with
      let imageUrls:string[] = [url];
    
      // Call the startChat function
      const transactionResponse = await contract.startChat(prompt, imageUrls)
      const receipt = await transactionResponse.wait()
      console.log(`Message sent, tx hash: ${receipt.hash}`)
      console.log(`Chat started with message: "${prompt}"`)
    
      // Get the chat ID from transaction receipt logs
      let chatId = getChatId(receipt, contract);
      console.log(`Created chat ID: ${chatId}`)
      if (!chatId && chatId !== 0) {
        return "Error: Could not get chat ID from transaction receipt logs"
      }
    
      let allMessages: Message[] = []
      // Run the chat loop: read messages and send messages
      let i:number = 0;
      while (i<300) {
        const newMessages: Message[] = await getNewMessages(contract, chatId, allMessages.length);
        if (newMessages) {
          for (let message of newMessages) {
            console.log(`${message.role}: ${message.content}`)
           // allMessages.push(message)
            if (message.role === "assistant") {
              return message.content
            } 
          }
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
        i++;
      }
      return "Error: service timed out ... try again later."
}

async function getNewMessages(
    contract: Contract,
    chatId: number,
    currentMessagesCount: number
  ): Promise<Message[]> {
    const messages = await contract.getMessageHistory(chatId)
  
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