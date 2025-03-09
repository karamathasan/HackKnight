document.addEventListener("mouseup", async ()=>{
    console.log("mouseclick")
    await apicall()
})


async function apicall(){
    // await fetch()
    fetch('http://127.0.0.1:5000/test', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((data)=>{
        console.log(data)
    })
    
}
