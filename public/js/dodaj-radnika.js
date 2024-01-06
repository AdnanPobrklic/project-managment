import { revealPasswordLogic, inputChangeListener, setStatusMessage } from "./script.js"

document.querySelectorAll(".showPassword").forEach((element, index) => {
    element.addEventListener("click", e => revealPasswordLogic(e));
})

document.querySelectorAll(".input-pwd-txt").forEach((element, index) => {
    element.addEventListener("keyup", e => {
        inputChangeListener(e);
    });
})

document.querySelector("form").addEventListener("submit", async e => {
    e.preventDefault();

    if(document.querySelector("#sifra").value != document.querySelector("#ponovaSifra").value){
        setStatusMessage("active", "fail", "Šifre se moraju poklapati");
        return;
    }

    try {
        const formData = new FormData(document.querySelector("form"));
        const data = Object.fromEntries(formData);

        const response = await fetch("/korisnici/dodaj-korisnika", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const resObj = {status: response.status, message: (await response.json()).message};

        if(resObj.status === 201){
            setStatusMessage("active", "success", resObj.message);
            document.querySelector("form").reset();
        }else if(resObj.status === 400){
            setStatusMessage("active", "fail", resObj.message);
        }else{
            throw new Error();
        }

    }catch(err){
        console.log(err);
        alert("Nešto je krenulo po zlu");
    }
    
})
