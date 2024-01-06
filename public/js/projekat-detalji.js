import { setStatusMessage } from "./script.js";

const url = window.location.href;
const projectId = url.substring(url.lastIndexOf("/") + 1);

document.querySelectorAll(".trash-icon-zadatak").forEach(el => {
    el.addEventListener("click", async e => {

        let naslovZadatka = e.target.parentElement.parentElement.children[0].textContent;
        naslovZadatka = naslovZadatka.substring(8); 

        const data = {naslov: naslovZadatka};


        try{
            const response = await fetch(`/projekti/izbrisi-zadatak-projekatu/${projectId}`, {
                method: "DELETE",
                credentials: "include",
                headers:{
                    "Content-type": "application/json"  
                },
                body: JSON.stringify(data)
            })

            const resObj = {status: response.status, message: (await response.json()).message};

            if(resObj.status === 200){
                setStatusMessage("active", "success", resObj.message);
                setTimeout( () => window.location.reload(), 1500);
            }else if(resObj.status === 404 || resObj.status === 500 || resObj.status === 400){
                setStatusMessage("active", "fail", resObj.message);
            }else{
                throw new Error();
            }
        }catch(err){
            alert("Nešto je krenulo po zlu");
        }
    })
})