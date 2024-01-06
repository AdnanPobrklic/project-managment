import { setStatusMessage } from "./script.js";

document.querySelector("#zadanDatuma").addEventListener("change", function() {
    document.querySelector("#krajniRok").min = this.value;
});

document.querySelector("form").addEventListener("submit", async e => {
    e.preventDefault();
    const url = window.location.href;
    const projectId = url.substring(url.lastIndexOf("/") + 1);

    try{

        const formData = new FormData(document.querySelector("form"));
        let data = Object.fromEntries(formData);

        const response = await fetch(`/projekti/dodaj-zadatak-projekatu/${projectId}`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(data)
        })

        const resObj = {status: response.status, message: (await response.json()).message};

        if(resObj.status === 201){
            setStatusMessage("active", "success", resObj.message);
            document.querySelector("#opis").value = ""
            document.querySelector("#naslov").value = ""
        }else if(resObj.status === 400 || resObj.status === 500){
            setStatusMessage("active", "fail", resObj.message);
        }else{
            throw new Error();
        }
    }catch(err){
        alert("Nešto je krenulo po zlu");
    }
})