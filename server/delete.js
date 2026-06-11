let p=new Promise((resolve,reject)=>{
    let a=1+1;
    if(a==2) resolve("Success");
    else reject("failed");
})

p.then((message)=>{
    console.log(message);
}).catch((err)=>{
    console.log(message);
})