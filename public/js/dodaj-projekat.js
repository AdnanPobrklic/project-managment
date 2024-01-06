import { setStatusMessage } from "./script.js";

const form = document.querySelector("#unos-projekta");

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

document.querySelector("#startniDatum").addEventListener("change", function() {
    document.querySelector("#zavrsniDatum").min = this.value;
});


form.addEventListener("submit", async e => {
    e.preventDefault();

    try{
        const formData = new FormData(document.querySelector("#unos-projekta"));
        const selectedWorkers = Array.from(document.querySelectorAll("#radnici-slct option:checked"), option => option.value);
        let data = Object.fromEntries(formData);
        data.radnici = selectedWorkers;

        const response = await fetch("/projekti/dodaj-projekat", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(data)
        });
    
        const resObj = {status: response.status, message: (await response.json()).message};
    
        if(resObj.status === 201){
            setStatusMessage("success", "active", resObj.message);
            setTimeout(() => {
                window.location.reload();
            }, 1000)
        }else{
            setStatusMessage("fail", "active", resObj.message);
        }
    }catch(err){
        console.log(err);
        alert("Nešto je krenulo po zlu");
    }
})



