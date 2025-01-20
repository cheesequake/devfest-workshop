import axios from "axios"
import { useState } from "react"

export default function PdfViewer({ setPdfUploaded }) {

    const [fileURL, setFileURL] = useState ()

    const handleChange = async (e) => {
        const fileUploaded = e.target.files[0]
        if (fileUploaded.type === "application/pdf") {
            setFileURL (URL.createObjectURL(fileUploaded))
            setPdfUploaded (true)

            const formData = new FormData();
            formData.append('pdf', fileUploaded);

            await axios.post ("http://localhost:5000/upload-pdf", formData)
        }
        else {
            alert ("Please upload a PDF only!")
            setPdfUploaded (false)
            e.target.value = ""
        }
    }

    return <div className="w-1/2 flex flex-col items-center">
        <input type="file" onChange={handleChange} />

        <object className="w-full h-full" data={fileURL} />
  </div>
}