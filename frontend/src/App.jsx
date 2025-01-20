import { useState } from "react"
import ChatInterface from "./components/ChatInterface"
import PdfViewer from "./components/PdfViewer"

function App() {
  const [pdfUploaded, setPdfUploaded] = useState (false)

  return (
    <div className="w-full min-h-screen max-h-screen flex">
      <PdfViewer setPdfUploaded={setPdfUploaded} />
      <ChatInterface pdfUploaded={pdfUploaded} />
    </div>
  )
}

export default App
