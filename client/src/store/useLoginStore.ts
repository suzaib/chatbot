//Create is the function that creates the zustand store
import {create} from 'zustand';

//Persist saves the zustand store with a storage backend
//It synchronizes both therefore each time you change the state using set, persist automatically writes the updated state to storage
import {persist,createJSONStorage} from 'zustand/middleware';

//Persist signature is roughly : persist(stateCreator,options)  

//Each user has its own separate zustand store where it stores its information
//So this store will only store one user's info, the user who is logged in

//We create the login store using create function
const useLoginStore=create(

    //We wrap everything inside persist, so that each time any state is created or modified, persists immediately updates the storage
    //Otherwise the changes made would have been lost
    persist(

        //StateCreator (What our store looks like)
        (set)=>({

            //These are the intial state
            step:1,
            userEmailData:null,

            //These are the functions that will be used to modify the state
            setStep:(step)=>set({step}),
            setUserEmailData:(data)=>set({userEmailData:data}),
            resetLoginState:()=>set({step:1,userEmailData:null})
        }),

        //Options (How persist should behave)
        {

            //Save my persisted state under name login-storage
            name:"login-storage",

            //At the top we wrote some states and some functios. But functions don't change and therefore there is no point in modifying them
            //Therefore partialize is used to tell persist which states to store
            //Also functions can't be stored in JSON
            partialize:(state)=>({
                step:state.step,
                userEmailData:state.userEmailData,
            })
        }
    )
)

export default useLoginStore;