import { useEffect, useRef, useState } from "react"
import useChatStore from "../../store/useChatStore";

//Check first whether it is a date object and secondly, does it has valid date
const isValidDate=(date)=>{
  return date instanceof Date && !isNaN(date)
}
const ChatWindow = ({selectedContact,setSelectedContact}) => {

  //Stores the text the user is typing
  const [message,setMessage]=useState("");

  //Controls whether the emoji picker icon is visible or not
  const [showEmojiPicker,setEmojiPicker]=useState(false);

  //Controls whether the file menu is visible or not
  const [showFileMenu,setShowFileMenu]=useState(false);

  //To show a preview of the file before sending
  const [filePreview,setFilePreview]=useState(null);

  //Sets the file selected for sending
  const [selectedFile,setSelectedFile]=useState(null);

  //Store a timer for the typing indicator
  const typingTimeoutRef=useRef(null);

  //For smooth scrolling
  const messageEndRef=useRef(null);

  //To close the emoji picker if the user clicks outside 
  const emojiPickerRef=useRef(null);

  //Show the file attachment icon
  const fileInputRef=useRef(null);

  const {theme}=useThemeStore();
  const {user}=useUserStore();

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
  }=useChatStore();

  //Get online status and last seen
  const online=isUserOnline(selectedContact?._id);
  const lastSeen=getUserLastSeen(selectedContact?._id);
  const isTyping=isUserTyping(selectedContact?._id);

  useEffect(()=>{
    if(selectedContact?._id && conversation?.data?.length>0){
      const conversation=conversations?.data?.find((conv)=>
      conv.participants.some((participant)=> participant._id === selectedContact?._id))
      if(conversation._id) fetchMessages(conversation._id);
    }
  },[selectedContact,conversations]);

  useEffect(()=>{
    fetchConversations();
  },[]);

  const scrollToBottom=()=>{
    messageEndRef.current?.scrollIntoView({behaviour:"auto"});
  };

  useEffect(()=>{
    scrollToBottom();
  },[messages])

  useEffect(()=>{
    if(message && selectedContact){
      startTyping(selectedContact?._id);

      //We start a new timer
      typingTimeoutRef.current=setTimeout(()=>{
        stopTyping(selectedContact?._id);
      },2000);
    }

    //The cleanup function runs each time useEffect is called again and when the component umounts
    //It clears any previous timeout, otherwise typing each letter would trigger a new timer
    return ()=>{
      if(typingTimeoutRef.current){
        clearTimeout(typingTimeoutRef.current);
      }
    }
  },[message,selectedContact,startTyping,stopTyping])

  //Opening a popup when the user want to send a file
  const handleFileChange=(e)=>{
    const file=e.target.files[0];
    if(file){
      setSelectedFile(file);
      setShowFileMenu(false);
      if(file.type.startsWith('image/')) setFilePreview(URL.createObjectURL(file));
    }
  }

  const handleSendMessage=async()=>{
    if(!selectedContact) return;
    setFilePreview(null);
    try{
      const formData=new FormData();
      formData.append("senderId",user?._id);
      formData.append("receiverId",selectedContact?._id);

      const status=online? "delivered":"send";
      formData.append("messageStatus",status);

      if(message.trim()) formData.append("content",message.trim());

      //If there is a file included, include that too
      if(selectedFile) formData.append("media",selectedFile,selectedFile.name);

      if(!message.trim() && !selectedFile) return;
      await sendMessage(formData);

      //Clear all states
      setMessage("");
      setFilePreview(null);
      setSelectedContact(null);
      setShowFileMenu(false);
    }
    catch(error){
      console.error("Failed to send message",error);
    }
  }
  return (
    <div>ChatWindow</div>
  )
}

export default ChatWindow