import { setStatusMessage } from "./script.js";

const projekatSelect = document.querySelector("#projekat");

Window.onload = fetchAndSetSelects(projekatSelect);

projekatSelect.addEventListener("change", async e => {
    fetchAndSetSelects(e.target);
})

async function fetchAndSetSelects(element){
    const projectId = element.value;
    const res = await fetch(`/projekti/zadaci/${projectId}`);

    const resObj = await res.json();

    let selectZadatak = document.querySelector("#zadatak");
    while (selectZadatak.firstChild) {
        selectZadatak.removeChild(selectZadatak.firstChild);
    }

    let sviSuIzvrseni = true;
    resObj.data.forEach(element => {
        if(element.izvrsen === false) sviSuIzvrseni = false;
    })
    
    if(!sviSuIzvrseni){
        resObj.data.forEach(element => {
            if(!element.izvrsen){
                const option = document.createElement("option");
                option.textContent = element.naslov;
                option.value =  element._id;
                selectZadatak.appendChild(option);
            }
        })
    }else{
        const option = document.createElement("option");
        option.textContent = "Nemate zadataka";
        option.value = "Nemate zadataka";
        selectZadatak.appendChild(option);
    }
}

document.querySelector("form").addEventListener("submit", async e => {
    e.preventDefault();
    try{
        const formData = new FormData(document.querySelector("form"));
        const data = Object.fromEntries(formData);

        const res =  await fetch(`/projekti/unos-zadatka/${data.zadatak}`, {
            method: "POST",
            credentials: "include",
            headers:{
                "Content-type": "application/json"
            },
            body: JSON.stringify(data)
        })

        const resObj = {status: res.status, message: (await res.json()).message};

        if(resObj.status === 200){
            setStatusMessage("active", "success", "Zadatak unjet");
            setTimeout(() => window.location.reload(), 1500);
        }else if(resObj.status >= 400 && resObj.status <= 499){
            setStatusMessage("active", "fail", resObj.message);
        }else{
            throw new Error();
        }

    }catch(err){
        alert("Nešto je krenulo po zlu");
    }
})