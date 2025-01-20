import { useEffect, useState } from "react"
import Message from "./Message"
import axios from "axios"

export default function ChatInterface ({ pdfUploaded }) {
    const [messages, setMessages] = useState ([])
    const [currentMessage, setCurrentMessage] = useState ()

    // This function gets called when send button is clicked :)
    const handleSend = async () => {
        const trimmedMessage = currentMessage.trim();

        if (trimmedMessage === "") {
            alert("Please write a query before sending");
            return;
        }

        const userMessage = { sender: 'user', message: trimmedMessage };
        setMessages(prevMessages => [...prevMessages, userMessage]);

        try {
            const response = await axios.post("http://localhost:5000/ask", { message: trimmedMessage });
            setMessages(prevMessages => [...prevMessages, response.data]);
            setCurrentMessage('');
        } catch (error) {
            console.error(error);
            alert("Failed to get response from the bot");
        }
    }

    const handleTextInput = (e) => {
        setCurrentMessage (e.target.value)
    }

    return <div className="w-1/2 flex flex-col justify-end border-2 border-teal-500">
        <div className="w-full flex flex-col overflow-y-scroll">
            {messages.map((messageObj, index) => {
                return <Message key={index} messageObj={messageObj} />
            })}
        </div>

        {/* send and input */}
        <div className="flex w-full">
            <input type="text" className="border-2 border-teal-500 w-10/12 p-1" placeholder="Enter a query" onChange={handleTextInput} />
            <button className={`w-2/12 border-2 border-teal-500 bg-teal-500 p-1 ${!pdfUploaded && "cursor-not-allowed"}`} onClick={handleSend} disabled={!pdfUploaded}>Send</button>
        </div>
  </div>
}