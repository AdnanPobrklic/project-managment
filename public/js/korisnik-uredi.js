import { revealPasswordLogic, inputChangeListener, setStatusMessage } from "./script.js";

document.querySelectorAll(".showPassword").forEach((element, index) => {
    element.addEventListener("click", e => revealPasswordLogic(e));
});

document.querySelectorAll(".input-pwd-txt").forEach((element, index) => {
    element.addEventListener("keyup", e => {
        inputChangeListener(e);
    });
});

document.querySelector("form").addEventListener("submit", async e => {
    e.preventDefault();
    const url = window.location.href;
    const userId = url.substring(url.lastIndexOf("/") + 1);
    const submitButton = e.submitter;

    if (submitButton.name === "spasiPromjene") {

        if(document.querySelector("#sifra").value != document.querySelector("#ponovaSifra").value){
            setStatusMessage("active", "fail", "Šifre se moraju podudarati !"); 
            return;
        }

        try{
            const formData = new FormData(document.querySelector("form"));
            const data = Object.fromEntries(formData);
    
            const res = await fetch(`/korisnici/azuriraj-korisnika/${userId}`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(data)
            });
    
            const resObj = {status: res.status, message: (await res.json()).message};
    
            if(resObj.status === 200){
                setStatusMessage("active", "success", resObj.message);
            }else if(resObj.status === 400 || resObj.status === 404){
                setStatusMessage("active", "fail", resObj.message);
            }else{
                throw new Error();
            }
        }catch(err){
            alert("Neuspjeh, nešto je krenulo po zlu")
        }   

    } else if (submitButton.name === "brisanje") {

        try{
            const res = await fetch(`/korisnici/obrisi-korisnika/${userId}`, {
                method: "DELETE",
                credentials: "include"
            });
    
            const resObj = {status: res.status, message: (await res.json()).message};
    
            if(resObj.status === 200){
                setStatusMessage("active", "success", resObj.message);
                setTimeout(() => {
                    window.location.href = "/radna-povrsina/svi-korisnici";
                }, 2000)
            }else{
                throw new Error();
            }
        }catch(err){
            alert("Neuspjeh, nešto je krenulo po zlu")
        }
    }
});
