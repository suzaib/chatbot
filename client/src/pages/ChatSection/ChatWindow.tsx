import { useEffect, useRef, useState } from "react"
import useChatStore from "../../store/useChatStore";
import { isToday, isYesterday, format } from 'date-fns';
import { FaArrowLeft, FaEllipsisV, FaLock, FaSmile, FaTimes, FaVideo } from "react-icons/fa";
import MessageBubble from "./MessageBubble";

//Check first whether it is a date object and secondly, does it has valid date
const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date)
}
const ChatWindow = ({ selectedContact, setSelectedContact }) => {

  //Stores the text the user is typing
  const [message, setMessage] = useState("");

  //Controls whether the emoji picker icon is visible or not
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  //Controls whether the file menu is visible or not
  const [showFileMenu, setShowFileMenu] = useState(false);

  //To show a preview of the file before sending
  const [filePreview, setFilePreview] = useState(null);

  //Sets the file selected for sending
  const [selectedFile, setSelectedFile] = useState(null);

  //Store a timer for the typing indicator
  const typingTimeoutRef = useRef(null);

  //For smooth scrolling
  const messageEndRef = useRef(null);

  //To close the emoji picker if the user clicks outside 
  const emojiPickerRef = useRef(null);

  //Show the file attachment icon
  const fileInputRef = useRef(null);

  const { theme } = useThemeStore();
  const { user } = useUserStore();

  const {
    messages,
    loading,
    sendMessage,
    receiveMessage,
    fetchMessage,
    fetchConversations,
    conversations,
    isUserTyping,
    startTyping,
    stopTyping,
    getUserLastSeen,
    isUserOnline,
    addReactions,
    deleteMessage,
    cleanup,
  } = useChatStore();

  //Get online status and last seen
  const online = isUserOnline(selectedContact?._id);
  const lastSeen = getUserLastSeen(selectedContact?._id);
  const isTyping = isUserTyping(selectedContact?._id);

  useEffect(() => {
    if (selectedContact?._id && conversation?.data?.length > 0) {
      const conversation = conversations?.data?.find((conv) =>
        conv.participants.some((participant) => participant._id === selectedContact?._id))
      if (conversation._id) fetchMessages(conversation._id);
    }
  }, [selectedContact, conversations]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behaviour: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages])

  useEffect(() => {
    if (message && selectedContact) {
      startTyping(selectedContact?._id);

      //We start a new timer
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(selectedContact?._id);
      }, 2000);
    }

    //The cleanup function runs each time useEffect is called again and when the component umounts
    //It clears any previous timeout, otherwise typing each letter would trigger a new timer
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  }, [message, selectedContact, startTyping, stopTyping])

  //Opening a popup when the user want to send a file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setShowFileMenu(false);
      if (file.type.startsWith('image/')) setFilePreview(URL.createObjectURL(file));
    }
  }

  const handleSendMessage = async () => {
    if (!selectedContact) return;
    setFilePreview(null);
    try {
      const formData = new FormData();
      formData.append("senderId", user?._id);
      formData.append("receiverId", selectedContact?._id);

      const status = online ? "delivered" : "send";
      formData.append("messageStatus", status);

      if (message.trim()) formData.append("content", message.trim());

      //If there is a file included, include that too
      if (selectedFile) formData.append("media", selectedFile, selectedFile.name);

      if (!message.trim() && !selectedFile) return;
      await sendMessage(formData);

      //Clear all states
      setMessage("");
      setFilePreview(null);
      setSelectedContact(null);
      setShowFileMenu(false);
    }
    catch (error) {
      console.error("Failed to send message", error);
    }
  }

  const renderDateSeparator = (date) => {
    if (!isValidDate(date)) return null;

    let dateString;
    if (isToday(date)) dateString = "Today";
    else if (isYesterday(date)) dateString = "Yesterday";
    else dateString = format(date, "EEEE,MMMM d");

    return (
      <div className="flex justify-center-my-4">
        <span className={`px-4 py-2 rounded-full text-sm ${theme === 'dark' ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}`}>
          {dateString}
        </span>
      </div>
    )
  }

  //Grouping messages
  //We group all valid messages by the date they were created
  //Just like whatsapp on top shows dates like 25/03/2003 and under it shows all the messages on that day, we are doing exactly that
  //First we check whether the messages is actually an array, if it is, then we process it, otherwise we simply return {}
  const groupMessages=Array.isArray(messages)? messages.reduce((acc,message)=>{

    //If the message doesn't have a creation date, it skips that message
    if(!message.createdAt) return acc;

    //We then convert createdAt in a JS date
    const date=new Date(message.createdAt);

    //And then check if the date is valid, if it is
    if(isValidDate(date)){
      const dateString=format(date,"yyyy-MM-dd");

      //If that particular date string isn't there, create a new array and push the message inside it
      if(!acc[dateString]) acc[dateString]=[];
      acc[dateString].push(message);
    }
    else console.error("Invalid date for message",message);

    return acc;
  },{}):{};

  const handleReaction=(messageId,emoji)=>{
    addReactions(messageId,emoji);
  }

  if(!selectedContact) return(
    <div className="flex-1 flex flex-col items-center justify-center mx-auto h-screen text-center">
      <div className="max-w-md">
        <img 
          src={whatsappImage}
          alt="chat-app"
          className="w-full h-auto"
        />
        <h2 className={`text-3xl font-semibold mb-4 ${theme==='dark'? "text-white":"text-black"}`}>
          Select a conversation to start chatting
        </h2>
        <p className={`mb-6 ${theme==='dark'? "text-gray-400":"text-gray-600"}`}>
          Choose a contact from the list on the left side to begin messaging
        </p>
        <p className={`text-sm mt-8 flex items-center justify-center gap-2 ${theme==='dark'? "text-gray-400":"text-gray-600"}`}>
          <FaLock className="h-4 w-4"/>
          Your personal messages are end to end encrypted
        </p>
      </div>
    </div>
  )
  return (
    <div className="flex-1 h-screen w-full flex flex-col">
      <div className={`p-4 flex items-center ${theme==='dark'? "bg-[#303430] text-white":"bg-[rgb(239,242,245)] text-gray-600"}`}>
        <button 
          className="mr-2 focus:outline-none"
          onClick={()=>setSelectedContact(null)}>
          <FaArrowLeft className="h-6 w-6"/>
        </button>
        <img 
          src={selectedContact?.profilePicture}
          alt={selectedContact?.username}
          className="h-10 w-10 rounded-full"
        />
        <div className="ml-3 flex-grow">
          <h2 className="font-semibold text-start">
            {selectedContact?.username}
          </h2>

          {isTyping? (
            <div>Typing...</div>
          ):(
            <p className={`text-sm ${theme==='dark'? "text-gray-400":"text-gray-500"}`}>
              {online? "Online": lastSeen? `Last Seen ${format(new Date(lastSeen),"HH:mm")}`:"Offline"}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button className="focus:outline-none">
            <FaVideo className="h-5 w-5"/>
          </button>
          <button className="focus:outline-none">
            <FaEllipsisV className="h-5 w-5"/>
          </button>
        </div>
      </div>

      <div className={`flex-1 p-4 overflow-y-auto ${theme==='dark'?"bg-[#191a1a]":"bg-[rgb(241,236,239)]"}`}>
        {Object.entries(groupMessages).map(([date,msgs])=>(
          <React.Fragment key={date}>
            {renderDateSeparator(new Date(date))}
            {msgs.filter((msg)=>msg.conversation===selectedContact?.conversation?._id).map((msg)=>(
              <MessageBubble
                key={msg._id || msg.tempId}
                message={msg}
                theme={theme}
                currentUser={user}
                onReact={handleReaction}
                deleteMessage={deleteMessage}
              />
            ))}
          </React.Fragment>
        ))}
        <div ref={messageEndRef}/>
      </div>
      {filePreview && (
        <div className="relative p-2">
          <img 
            src={filePreview}
            alt="file-preview"
            className="w-80 object-cover rounded shadow-lg mx-auto"
          />
          <button
            onClick={()=>{
              setSelectedFile(null)
              setFilePreview(null)
            }}
            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1">
            <FaTimes className="h-4 w-4"/>
          </button>
        </div>
      )}

      <div className={`p-4 flex items-center space-x-2 ${theme==='dark'? "bg-[#303430]":"bg-white"}`}>
        <button
          className="focus:outline-none"
          onClick={()=>setShowEmojiPicker(!showEmojiPicker)}>
          <FaSmile className={`h-6 w-6 ${theme==='dark'? "text-gray-400":"text-gray-500"}`}/>
        </button>
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute left-0 bottom-16 z-50">
            
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatWindow