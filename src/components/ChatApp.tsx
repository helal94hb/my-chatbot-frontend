import React, { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import TextareaAutosize from "react-textarea-autosize";
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import Header from "./Header";
import companyLogo from "./assets/logo.png"


// --- Constants ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_V2 || "http://localhost:8000/api/v2";

// --- API Client ---
const API = axios.create({
  baseURL: API_BASE_URL,
});
console.log(`V2 Frontend using API Base URL: ${API_BASE_URL}`);

// --- Logger ---
const logger = {
    info: (...args: any[]) => console.log("INFO:", ...args),
    error: (...args: any[]) => console.error("ERROR:", ...args),
    warn: (...args: any[]) => console.warn("WARN:", ...args),
    debug: (...args: any[]) => console.debug("DEBUG:", ...args),
};

// --- Types ---

// Matches backend FeedbackTypeEnum
type FeedbackType = "accept" | "reject";

interface Message {
  id: string; // Frontend unique key
  role: "user" | "bot";
  content: string;
  message_id?: string; // Backend message UUID (for bot messages)
  feedback?: FeedbackType | null; // Track submitted feedback status
  attempt_number?: number;
}

interface Session {
  id: string; // Backend session UUID
  name: string;
  created_at: string;
}

interface QueryPayload {
    query: string;
    session_id: string | null;
    product_filter?: string | null;
}

interface TopResultPreview {
    id: string;
    score: number;
    content_preview: string;
    original_file: string | null;
}

interface BackendResponseDetails {
    session_id: string;
    message_id?: string;
    attempt_number?: number;
    retrieved_ids?: string[];
    search_scores?: number[];
    original_file?: string | null;
}

interface BackendQueryResponse {
    llm_answer: string;
    context_used_preview?: string;
    top_result_preview?: TopResultPreview | null;
    details: BackendResponseDetails;
}

interface FeedbackPayload {
    message_id: string;
    feedback_type: FeedbackType;
    feedback_comment?: string | null;
}

interface FeedbackLogResponse {
    id: string; // Feedback log ID
    message_id: string;
    feedback_type: FeedbackType;
    feedback_comment?: string | null;
    created_at: string;
}

interface RegeneratedResponse {
    new_llm_answer: string;
    new_context_used_preview?: string;
    new_top_result_preview?: TopResultPreview | null;
    new_details: BackendResponseDetails;
}

function isRegeneratedResponse(response: any): response is RegeneratedResponse {
  return response && typeof response.new_llm_answer === 'string';
}


// --- Chat Message Component ---
interface ChatMessageProps {
  role: "user" | "bot";
  content: string;
  message_id?: string; // Backend UUID for bot messages
  feedback?: FeedbackType | null; // Current feedback status
  isFeedbackLoading: boolean; // To disable buttons during API call
  isLatestBotMessage: boolean; // Flag to indicate if this is the last bot message
  onFeedback?: (messageId: string, type: FeedbackType) => void; // Callback
}

const ChatMessage = React.memo<ChatMessageProps>(({
    role,
    content,
    message_id,
    feedback,
    isFeedbackLoading,
    isLatestBotMessage,
    onFeedback
}) => {
  const isUser = role === "user";
  const [isCopied, setIsCopied] = useState(false);
  

  let displayContent: string = "";
  if (typeof content === 'string') {
      displayContent = content;
  } else if (content) {
      // logger.warn("ChatMessage received non-string content:", content);
      try { displayContent = JSON.stringify(content); } catch { displayContent = "[Unsupported Content Type]"; }
  }

  const handleCopy = async () => {
    if (!displayContent) return;
    try {
      await navigator.clipboard.writeText(displayContent);
      setIsCopied(true);
      // logger.info("Copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      // logger.error("Failed to copy text: ", err);
    }
  };

  const handleFeedbackClick = (type: FeedbackType) => {
    if (message_id && onFeedback && !isFeedbackLoading) {
        // logger.info(`Feedback clicked: ${type} for message ${message_id}`);
        onFeedback(message_id, type);
    }
  };

  const getButtonClass = (buttonType: FeedbackType): string => {
    const baseClass = 'p-1 rounded-full transition duration-150 focus:outline-none';
    const isDisabled = isFeedbackLoading;
    const disabledOrBase = isDisabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400';
    const hoverClass = isDisabled ? '' : (buttonType === 'accept' ? 'hover:text-green-600 hover:bg-green-100' : 'hover:text-red-600 hover:bg-red-100');
    const activeClass = feedback === buttonType ? (buttonType === 'accept' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100') : '';
    return `${baseClass} ${activeClass || disabledOrBase} ${hoverClass}`;
  };

  // --- STYLE REFRESH ---
  // User bubble gets the primary gradient and shadow style.
  // Bot bubble gets a clean, professional, and distinct style.
  const bubbleClass = isUser
    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none shadow-lg shadow-grey-500/30"
    : "bg-white text-gray-800 rounded-bl-none border border-gray-200 shadow-md";

  return (
    // --- LAYOUT REFRESH:
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-4 group`}>
      <div className={`flex flex-col max-w-[85%]`}> {/* Increased max-width slightly for a better look without avatars */}
        <div className={`px-4 py-3 rounded-2xl text-sm break-words ${bubbleClass}`}>
          <ReactMarkdown
            remarkPlugins={[remarkBreaks, remarkGfm]}
            components={{
                code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '')
                    // Use a slightly darker code block for bot messages for better contrast on the white background
                    const codeBg = isUser ? 'bg-blue-900/40' : 'bg-gray-100';
                    return !inline ? (
                      <pre className={`${codeBg} p-3 rounded-md mt-1 mb-1 overflow-x-auto text-xs`}><code className={className} {...props}>{String(children).replace(/\n$/, '')}</code></pre>
                    ) : (
                      <code className={`${codeBg} px-1 py-0.5 rounded text-xs font-mono`} {...props}>{children}</code>
                    )
                },
                strong({node, children, ...props}) { return <strong className="font-semibold" {...props}>{children}</strong> },
                ul({node, children, ...props}) { return <ul className="list-disc list-inside my-2 space-y-1 pl-4" {...props}>{children}</ul> },
                ol({node, children, ...props}) { return <ol className="list-decimal list-inside my-2 space-y-1 pl-4" {...props}>{children}</ol> },
                p({node, children, ...props}) { return <p className="mb-2 last:mb-0" {...props}>{children}</p> },
                table({ node, children, ...props }) { return <table className="table-auto border-collapse border border-gray-300 my-2 w-full text-xs" {...props}>{children}</table>; },
                thead({ node, children, ...props }) { return <thead className={isUser ? "bg-black/20" : "bg-gray-100"} {...props}>{children}</thead>; },
                th({ node, children, ...props }) { return <th className={`border ${isUser ? 'border-blue-400' : 'border-gray-300'} px-2 py-1 text-left font-medium`} {...props}>{children}</th>; },
                td({ node, children, ...props }) { return <td className={`border ${isUser ? 'border-blue-400' : 'border-gray-300'} px-2 py-1`} {...props}>{children}</td>; },
            }}
          >
            {displayContent}
          </ReactMarkdown>
        </div>
        {/* --- Buttons Area Below Bubble --- */}
        <div className={`flex items-center gap-3 mt-1.5 text-xs w-full min-h-[20px] ${isUser ? 'pr-1 justify-end' : 'pl-1 justify-start'}`}>
            {isLatestBotMessage && message_id && onFeedback && (
                <>
                    <button onClick={() => handleFeedbackClick('accept')} disabled={isFeedbackLoading} className={getButtonClass('accept')} title="Correct Answer">
                        <svg xmlns="http://www.w.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </button>
                    <button onClick={() => handleFeedbackClick('reject')} disabled={isFeedbackLoading} className={getButtonClass('reject')} title="Incorrect Answer">
                        <svg xmlns="http://www.w.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </>
            )}
            {displayContent && !isUser && ( // Only show copy button for bot messages for a cleaner UI
              <button
                onClick={handleCopy}
                className={`text-gray-400 hover:text-gray-600 transition duration-150 focus:outline-none invisible group-hover:visible`}
                title={isCopied ? "Copied!" : "Copy text"}
              >
                {isCopied ? (
                  <span className="text-xs font-semibold text-green-600">Copied!</span>
                ) : (
                  <svg xmlns="http://www.w.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                )}
              </button>
            )}
        </div>
      </div>
    </div>
  );
});


// --- Main App Component ---
const ChatApp: React.FC = () => {
  // --- State ---
  const [chat, setChat] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false); // For query sending
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(false); // For session list
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false); // For loading chat history
  const [isFeedbackLoading, setIsFeedbackLoading] = useState<boolean>(false); // For feedback API call
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editedSessionName, setEditedSessionName] = useState<string>("");
  const navigate = useNavigate();


  // --- 3. CREATE THE LOGOUT FUNCTION ---
  const handleLogout = () => {
    logger.info("User logging out.");
    localStorage.removeItem('userToken'); // Clear the session token
    navigate('/login'); // Redirect to the login page
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- API Functions ---
  // ... (createSession, loadSessions, loadMessages, renameSession, handleSessionClick, sendMessage remain the same) ...
   const createSession = async () => {
    if (isLoading || isSessionLoading) return;
    logger.info("Creating new session...");
    setIsLoading(true);
    try {
      const res = await API.post("/sessions", { name: `Session ${new Date().toLocaleTimeString()}` });
      const newId = res.data.id;
      logger.info(`New session created: ${newId}`);
      setSessionId(newId);
      setChat([]); // Clear chat for new session
      await loadSessions(); // Refresh list
    } catch (error) {
      logger.error("Failed to create session", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSessions = async () => {
    setIsSessionLoading(true);
    try {
      const res = await API.get("/sessions");
      setSessions(res.data);
      logger.info(`Loaded ${res.data.length} sessions.`);
    } catch (error) {
      logger.error("Failed to load sessions", error);
      setSessions([]);
    } finally {
      setIsSessionLoading(false);
    }
   };

  const loadMessages = async (id: string) => {
    setIsChatLoading(true);
    setChat([]);
    try {
      const res = await API.get(`/sessions/${id}/messages`);
      const validatedMessages = res.data.map((msg: any): Message => ({
          id: uuidv4(),
          role: msg.role,
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content ?? '[Invalid Content]'),
          message_id: msg.role === 'bot' ? msg.id : undefined,
          feedback: msg.feedback?.feedback_type || null,
          attempt_number: msg.attempt_number,
      }));
      setChat(validatedMessages);
      logger.info(`Loaded ${validatedMessages.length} messages for session ${id}.`);
    } catch (error) {
      logger.error(`Failed to load messages for session ${id}`, error);
      setChat([]);
    } finally {
      setIsChatLoading(false);
    }
   };

  const renameSession = async (id: string, name: string) => {
    if (!name.trim() || sessions.find(s => s.id === id)?.name === name.trim()) {
      setEditingSessionId(null); return;
    }
    logger.info(`Renaming session ${id} to "${name}"`);
    try {
      await API.patch(`/sessions/${id}`, { name: name.trim() });
      setEditingSessionId(null);
      await loadSessions(); // Refresh list
    } catch (error) {
      logger.error(`Failed to rename session ${id}`, error);
    }
  };

  const handleSessionClick = (id: string) => {
    if (id === sessionId || isChatLoading) return;
    logger.info(`Switching to session: ${id}`);
    setSessionId(id);
    loadMessages(id);
  };

  const sendMessage = async () => {
    if (!input.trim() || !sessionId || isLoading || isFeedbackLoading) return;

    const userMessage: Message = { id: uuidv4(), role: "user", content: input.trim(), feedback: null };
    setChat((prev) => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      const payload: QueryPayload = {
          query: currentInput,
          session_id: sessionId,
      };
      logger.info("🚀 Sending V2 query payload:", payload);

      const response = await API.post<BackendQueryResponse>("/query", payload);
      logger.info("✅ V2 Backend Response:", response.data);

      const botContent = typeof response.data.llm_answer === 'string'
        ? response.data.llm_answer
        : JSON.stringify(response.data.llm_answer ?? "Invalid answer.");

      const botMessage: Message = {
          id: uuidv4(),
          role: "bot",
          content: botContent,
          message_id: response.data.details?.message_id,
          feedback: null,
          attempt_number: response.data.details?.attempt_number,
      };
      setChat((prev) => [...prev, botMessage]);

    } catch (error) {
      logger.error("❌ V2 Query error:", error);
      let errorMsg = "⚠️ Something went wrong with the V2 query.";
      if (axios.isAxiosError(error) && error.response) {
        errorMsg = `⚠️ Error: ${error.response.data?.detail || error.message}`;
      } else if (error instanceof Error) {
        errorMsg = `⚠️ Error: ${error.message}`;
      }
      setChat((prev) => [...prev, { id: uuidv4(), role: "bot", content: errorMsg, feedback: null }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- handleFeedback Function (remains the same as previous version) ---
  const handleFeedback = async (messageId: string, type: FeedbackType) => {
    if (isFeedbackLoading || isLoading) return;
    logger.info(`Submitting feedback: ${type} for message ${messageId}`);
    setIsFeedbackLoading(true);

    const payload: FeedbackPayload = {
        message_id: messageId,
        feedback_type: type,
    };

    try {
        const response = await API.post<FeedbackLogResponse | RegeneratedResponse>("/feedback", payload);
        logger.info("✅ Feedback response received:", response.data);

        setChat(prevChat => {
            const chatCopy = [...prevChat];
            const originalMessageIndex = chatCopy.findIndex(msg => msg.message_id === messageId);

            if (originalMessageIndex === -1) {
                logger.error(`Original message with backend ID ${messageId} not found.`);
                return prevChat;
            }

            chatCopy[originalMessageIndex] = { ...chatCopy[originalMessageIndex], feedback: type };

            if (isRegeneratedResponse(response.data)) {
                const regenData = response.data;
                logger.info("Received regenerated response. Inserting new message.");
                const regeneratedBotMessage: Message = {
                    id: uuidv4(), role: "bot",
                    content: regenData.new_llm_answer ?? "Error: Regenerated answer missing.",
                    message_id: regenData.new_details?.message_id,
                    feedback: null,
                    attempt_number: regenData.new_details?.attempt_number,
                };
                chatCopy.splice(originalMessageIndex + 1, 0, regeneratedBotMessage);
            } else {
                const feedbackLog = response.data as FeedbackLogResponse;
                logger.info(`Feedback (${feedbackLog.feedback_type}) logged successfully.`);
            }
            return chatCopy;
        });

    } catch (error) {
        logger.error(`❌ Feedback submission error for message ${messageId}:`, error);
        // Handle error display if needed
    } finally {
        setIsFeedbackLoading(false);
    }
  };

  // --- Other handlers ---
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // --- useEffect Hooks ---
  useEffect(() => { loadSessions(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat]);

  // --- JSX Structure ---
  return (
    <div className="min-h-screen h-screen flex bg-gray-100 font-sans text-sm">
      {/* Sidebar */}
            {/* Sidebar */}
      <div className="w-64 p-4 bg-[#f4f7f9] border-r shadow-lg flex flex-col flex-shrink-0 h-full">
        {/* Session list UI */}
        <img
          src={companyLogo}
          alt="Company Logo"
          className="h-8 mb-3 object-contain"
        />
      <button
        onClick={createSession}
        disabled={isLoading || isSessionLoading}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm px-3 py-2 rounded-lg mb-3 font-bold font-inter
                  shadow-lg shadow-grey-500/50
                  transition-all duration-200 ease-in-out
                  hover:shadow-xl hover:-translate-y-0.5
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
      >
        New Chat
      </button>
        <div className="flex-grow space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-track-[#f4f7f9] pr-1">
        {/* <div className="flex-grow space-y-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar"> */}
          {isSessionLoading && (
            <p className="text-xs text-gray-500 text-center py-2">
              Loading sessions...
            </p>
          )}
          {!isSessionLoading && sessions.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-2">
              No sessions yet.
            </p>
          )}
          {!isSessionLoading &&
            sessions.map((s) => (
              <div key={s.id} className="flex items-center gap-2 group">
                {editingSessionId === s.id ? (
                  <input
                    type="text"
                    value={editedSessionName}
                    onChange={(e) => setEditedSessionName(e.target.value)}
                    onBlur={() => renameSession(s.id, editedSessionName)}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        await renameSession(s.id, editedSessionName);
                      }
                    }}
                    className="flex-1 border border-indigo-300 px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => handleSessionClick(s.id)}
                    disabled={isChatLoading}
                    className={`flex-1 text-left px-3 py-2 rounded-lg text-sm truncate transition duration-150 ease-in-out ${s.id === sessionId ? "bg-indigo-100 text-indigo-800 font-medium" : "text-gray-600 hover:bg-gray-200"} ${isChatLoading ? "cursor-not-allowed opacity-70" : ""}`}
                    title={s.name}
                  >
                    {s.name}
                  </button>
                )}
                {editingSessionId !== s.id && (
                  <button
                    onClick={() => {
                      setEditingSessionId(s.id);
                      setEditedSessionName(s.name);
                    }}
                    className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md"
                    title="Rename Session"
                  >
                    {/* --- ICON REPLACEMENT --- */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Main Chat Area */}
              <div className="flex-1 flex flex-col h-full">
                <div className="flex flex-col border-l rounded-none shadow-lg bg-white overflow-hidden flex-grow h-full">
                  {/* Chat Messages Area */}
                  <Header onLogout={handleLogout}/>
                            {!sessionId && !isSessionLoading && (<div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-2">
                    <div className="text-center"> {/* Use text-center on a parent if you want them centered */}
          <h1 className="text-2xl font-bold font-inter bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent animate-gradient-flow nimate-electric-glow">
            Hi, I’m TAI
          </h1>
          <p className="text-lg text-gray-800"> {/* Kept this simpler for readability, but you can apply the gradient to it too if you wish */}
            How can I help you?
          </p>
        </div>
            </div>
          </div>)}
          <div id="chatbox" className="flex-1 px-6 py-4 overflow-y-auto bg-off White font-inter">

              {isChatLoading && sessionId && ( <div className="flex justify-center items-center text-sm pt-10">
  <div className="flex items-center gap-2 text-brandBlue">
    <span className="font-medium">Loading messages</span>
    {/* Pulsing Dots Animation using your theme color */}
    <div className="flex items-center gap-1">
      <div className="w-1.5 h-1.5 rounded-full bg-brandBlue animate-pulse" style={{ animationDelay: '0ms' }}></div>
      <div className="w-1.5 h-1.5 rounded-full bg-brandBlue animate-pulse" style={{ animationDelay: '200ms' }}></div>
      <div className="w-1.5 h-1.5 rounded-full bg-brandBlue animate-pulse" style={{ animationDelay: '400ms' }}></div>
    </div>
  </div>
</div> )}
              {/* Render chat messages with index */}
              {chat.map((msg, index) => {
                  const isLastMessage = index === chat.length - 1;
                  const isLatestBotMessage = msg.role === 'bot' && isLastMessage;

                  return (
                      <ChatMessage
                          key={msg.id}
                          role={msg.role}
                          content={msg.content}
                          message_id={msg.message_id}
                          feedback={msg.feedback}
                          isFeedbackLoading={isFeedbackLoading}
                          isLatestBotMessage={isLatestBotMessage} // Pass the flag
                          onFeedback={handleFeedback}
                      />
                  );
              })}
              {(isLoading || isFeedbackLoading) && (
<div className="flex justify-center items-center p-4">
  {/* Themed "Thinking" Icon */}
<div className="w-5 h-5 text-brandBlue animate-pulse animate-spin-slow">
    <svg xmlns="http://www.w.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      {/* A standard, clean path for a "sparkle" or "magic" icon */}
      <path d="M12 18L10.3636 13.6364L6 12L10.3636 10.3636L12 6L13.6364 10.3636L18 12L13.6364 13.6364L12 18ZM18 6L16.8 3.6L14.4 2.4L16.8 1.2L18 0L19.2 1.2L21.6 2.4L19.2 3.6L18 6Z"/>
    </svg>
  </div>

  {/* Animated Gradient Text */}
  <span className="ml-2 font-medium bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent bg-200% animate-gradient-flow">
    {isLoading ? "Thinking..." : "Regenerating..."}
  </span>
</div>
              )}
              <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-4 py-3 bg-white border-t flex-shrink-0">
            <div className="flex items-end gap-2">
              <TextareaAutosize
                  minRows={1} maxRows={4}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm resize-none transition disabled:bg-gray-100"
                  placeholder={sessionId ? "Type your message..." : "Select a session first..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading || isChatLoading || !sessionId || isFeedbackLoading} />
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || isChatLoading || !sessionId || !input.trim() || isFeedbackLoading}
                    title={!sessionId ? "Please select a session first" : "Send message"}
                    className="group flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                              bg-gradient-to-r from-blue-500 to-blue-600 text-white
                              font-medium font-inter text-sm
                              shadow-lg shadow-grey-500/50
                              transition-all duration-200 ease-in-out
                              hover:shadow-xl hover:-translate-y-0.5
                              disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                  >
                        {isLoading ? (
                          // A simple loading spinner for better visual feedback
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <>
                            <span>Send</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 transition-transform group-hover:translate-x-1">
                              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.826L11.25 9.25v1.5l-7.5 1.25a.75.75 0 00-.95.826l1.414 4.949a.75.75 0 00.95.826l14.25-2.375a.75.75 0 000-1.408L3.105 2.289z" />
                            </svg>
                          </>
                        )}
                      </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default ChatApp;
