import { useEffect } from "react";


const useOutsideClick=(ref,callback)=>{
    useEffect(()=>{
        const handleOutsideClick=(event)=>{
            if(ref.current && !ref.current.contains(event.target)) callback();
        }

        //Whenver the user presses mouse down button anywhere, call the handleOutsideClick function
        document.addEventListener("mousedown",handleOutsideClick);

        //When the component disappears, remove the attached event listener
        return ()=>{
            document.removeEventListener("mousedown",handleOutsideClick);
        }
    },[ref,callback])
}

export default useOutsideClick;