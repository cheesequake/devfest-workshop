export default function Message (props) {
    // This div has been styled using backticks. Such strings in Javascript allow to be
    // 'formatted', or modified according to some code inside the dollar sign. We are styling
    // this based on the message's sender being a user or not.

    return <div className={`max-w-96 w-fit flex m-1 p-2 break-words rounded-md ${props.messageObj.sender === 'user' ? "bg-blue-600 self-end rounded-br-none" : "bg-slate-300 self-start rounded-bl-none"}`} >
        {props.messageObj.message}
    </div>
}