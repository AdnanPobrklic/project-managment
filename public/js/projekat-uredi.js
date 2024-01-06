import { setStatusMessage } from "./script.js";

new MultiSelectTag('radnici-slct', {
    rounded: true,   
    shadow: true,     
    placeholder: 'Pretraga...',  
    tagColor: {
        textColor: '#161A30',
        borderColor: '#000',
        bgColor: '#eaffe6',
    }
})

document.querySelector("form").addEventListener("submit", async e => {
    e.preventDefault();
    const url = window.location.href;
    const projectId = url.substring(url.lastIndexOf("/") + 1);
    const submitButton = e.submitter;
    
    if(submitButton.name === "spasiPromjene"){
        try{
            const formData = new FormData(document.querySelector("form"));
            const selectedWorkers = Array.from(document.querySelectorAll("#radnici-slct option:checked"), option => option.value);
            let data = Object.fromEntries(formData);
            data.radnici = selectedWorkers;
    
            
            const response = await fetch(`/projekti/azuriraj-projekat/${projectId}`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(data)
            })
    
            const resObj = {status: response.status, message: (await response.json()).message};
    
            if(resObj.status === 200){
                setStatusMessage("active", "success", resObj.message);
                setTimeout( () => window.location.reload(), 1500);
            }else if(resObj.status === 400 || resObj.status === 500){
                setStatusMessage("active", "fail", resObj.message);
            }else{
                throw new Error();
            }
        }catch(err){
            alert("Nešto je krenulo po zlu");
        }
    }else if(submitButton.name === "brisanje"){
        try{
            const response = await fetch(`/projekti/izbrisi-projekat/${projectId}`, {
                method: "DELETE",
                credentials: "include",
            })

            const resObj = {status: response.status, message: (await response.json()).message};

            if(resObj.status === 200){
                setStatusMessage("active", "success", resObj.message);
                setTimeout( () => window.location.href = "/radna-povrsina/svi-projekti", 1500);
            }else if(resObj.status === 400 || resObj.status === 500){
                setStatusMessage("active", "fail", resObj.message);
            }else{
                throw new Error();
            }
        }catch(err){
            alert("Nešto je krenulo po zlu");
        }
    }
})