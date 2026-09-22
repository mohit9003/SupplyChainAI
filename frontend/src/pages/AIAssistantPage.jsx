import { useEffect, useState } from "react";

function AIAssistantPage() {

  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] =
    useState(null);

  const [history, setHistory] = useState([]);

  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");

  const [uploading, setUploading] =
    useState(false);

  const [loading, setLoading] =
    useState(false);


  // =====================================================
  // LOAD DOCUMENTS
  // =====================================================

  const loadDocuments = async () => {

    try {

      const response = await fetch(
        "http://localhost:8000/documents"
      );

      const data = await response.json();

      setDocuments(
        data.documents || []
      );

    } catch (error) {

      console.error(
        "Documents error:",
        error
      );
    }
  };


  // =====================================================
  // LOAD HISTORY
  // =====================================================

  const loadHistory = async () => {

    try {

      const response = await fetch(
        "http://localhost:8000/chat-history"
      );

      const data = await response.json();

      setHistory(
        data.history || []
      );

    } catch (error) {

      console.error(
        "History error:",
        error
      );
    }
  };


  useEffect(() => {

    loadDocuments();

    loadHistory();

  }, []);


  // =====================================================
  // UPLOAD PDF
  // =====================================================

  const handleUpload = async (event) => {

    const file =
      event.target.files?.[0];

    if (!file) return;


    if (
      !file.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {

      alert(
        "Please select a PDF file."
      );

      return;
    }


    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );


    setUploading(true);


    try {

      const response = await fetch(
        "http://localhost:8000/documents/upload",
        {
          method: "POST",
          body: formData
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Upload failed"
        );
      }


      await loadDocuments();


      setSelectedDocument({
        document_id:
          data.document_id,

        filename:
          data.filename
      });


      setMessages([
        {
          role: "ai",

          text:
            `I've processed "${data.filename}". ` +
            `It contains ${data.chunks} searchable sections. ` +
            `You can now ask me questions about this document.`
        }
      ]);


      await loadHistory();


    } catch (error) {

      alert(
        error.message
      );

    } finally {

      setUploading(false);

      event.target.value = "";
    }
  };


  // =====================================================
  // SEND QUESTION
  // =====================================================

  const sendMessage = async (event) => {

    event.preventDefault();

    const text =
      message.trim();

    if (
      !text ||
      loading ||
      !selectedDocument
    ) {

      return;
    }


    setMessages(
      previous => [
        ...previous,

        {
          role: "user",
          text
        }
      ]
    );


    setMessage("");

    setLoading(true);


    try {

      const token =
        localStorage.getItem(
          "token"
        );


      const response = await fetch(
        "http://localhost:8000/ai/chat",
        {
          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({

            message: text,

            document_id:
              selectedDocument.document_id
          })
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data?.detail ||
          "AI request failed"
        );
      }


      setMessages(
        previous => [
          ...previous,

          {
            role: "ai",

            text:
              data?.response ||
              "I couldn't generate a response."
          }
        ]
      );


      await loadHistory();


    } catch (error) {

      console.error(
        "AI Error:",
        error
      );


      setMessages(
        previous => [
          ...previous,

          {
            role: "ai",

            text:
              error.message ||
              "AI service is unavailable."
          }
        ]
      );


    } finally {

      setLoading(false);
    }
  };


  // =====================================================
  // OPEN HISTORY
  // =====================================================

  const openHistory = (
    item
  ) => {

    const document =
      documents.find(
        doc =>
          doc.document_id ===
          item.document_id
      );


    if (document) {

      setSelectedDocument(
        document
      );
    }


    setMessages([
      {
        role: "user",
        text: item.question
      },

      {
        role: "ai",
        text: item.answer
      }
    ]);
  };


  return (

    <div className="ai-page">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="ai-page-sidebar">

        <div className="ai-page-title">

          <div className="ai-big-icon">
            ✦
          </div>

          <div>

            <h2>
              AI Assistant
            </h2>

            <span>
              Document Intelligence
            </span>

          </div>

        </div>


        <label className="ai-upload-button">

          {uploading
            ? "Processing..."
            : "+ Upload PDF"}

          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={
              handleUpload
            }
            hidden
            disabled={
              uploading
            }
          />

        </label>


        <div className="ai-sidebar-section">

          <div className="ai-section-heading">
            Documents
          </div>


          {documents.length === 0 && (

            <div className="ai-empty">
              No documents yet
            </div>

          )}


          {documents.map(
            document => (

              <button
                key={
                  document.document_id
                }

                className={
                  selectedDocument?.document_id ===
                  document.document_id
                    ? "ai-document active"
                    : "ai-document"
                }

                onClick={() => {

                  setSelectedDocument(
                    document
                  );

                  setMessages([
                    {
                      role: "ai",

                      text:
                        `You're now chatting with "${document.filename}". Ask me anything about it.`
                    }
                  ]);

                }}
              >

                <span>
                  📄
                </span>

                <span className="document-name">

                  {document.filename}

                </span>

              </button>

            )
          )}

        </div>


        <div className="ai-sidebar-section">

          <div className="ai-section-heading">
            Recent Questions
          </div>


          {history.length === 0 && (

            <div className="ai-empty">
              No history yet
            </div>

          )}


          {history
            .slice()
            .reverse()
            .slice(0, 10)
            .map(item => (

              <button
                key={item.id}
                className="ai-history-item"
                onClick={() =>
                  openHistory(item)
                }
              >

                <strong>
                  {item.question}
                </strong>

                <span>
                  {item.filename}
                </span>

              </button>

            ))
          }

        </div>

      </aside>


      {/* =================================================
          MAIN CHAT
      ================================================= */}

      <main className="ai-page-main">

        <div className="ai-page-header">

          <div>

            <h1>
              {selectedDocument
                ? selectedDocument.filename
                : "AI Document Assistant"}
            </h1>

            <p>

              {selectedDocument
                ? "Ask questions about this document"
                : "Upload a PDF to start"}

            </p>

          </div>

        </div>


        <div className="ai-page-chat">

          {!selectedDocument && (

            <div className="ai-welcome">

              <div className="ai-welcome-icon">
                ✦
              </div>

              <h2>
                Chat with your documents
              </h2>

              <p>
                Upload any text-based PDF and
                ask questions about its content.
              </p>

              <label className="ai-primary-upload">

                Upload PDF

                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={
                    handleUpload
                  }
                  hidden
                />

              </label>

            </div>

          )}


          {selectedDocument && (

            <>

              <div className="ai-messages">

                {messages.map(
                  (msg, index) => (

                    <div
                      key={index}

                      className={
                        msg.role === "user"
                          ? "doc-message user"
                          : "doc-message"
                      }
                    >

                      <div className="message-label">

                        {msg.role === "user"
                          ? "You"
                          : "SupplyChainAI"}

                      </div>

                      <div>
                        {msg.text}
                      </div>

                    </div>

                  )
                )}


                {loading && (

                  <div className="doc-message">

                    <div className="message-label">
                      SupplyChainAI
                    </div>

                    Thinking...

                  </div>

                )}

              </div>


              <form
                className="ai-page-input"
                onSubmit={
                  sendMessage
                }
              >

                <input
                  value={message}
                  onChange={
                    e =>
                      setMessage(
                        e.target.value
                      )
                  }

                  placeholder={
                    "Ask anything about " +
                    selectedDocument.filename +
                    "..."
                  }

                  disabled={
                    loading
                  }
                />


                <button
                  type="submit"
                  disabled={
                    loading ||
                    !message.trim()
                  }
                >
                  ↑
                </button>

              </form>

            </>

          )}

        </div>

      </main>

    </div>
  );
}

export default AIAssistantPage;