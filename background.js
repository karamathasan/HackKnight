chrome.action.onClicked.addListener(async ()=>{
    await apicall()
})

async function apicall(){
    fetch('http://127.0.0.1:5000/test', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((data)=>{
        console.log(data)
    })
}