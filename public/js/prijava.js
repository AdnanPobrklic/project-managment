import { revealPasswordLogic, inputChangeListener, setStatusMessage } from "./script.js"

document.querySelector("#sifra").addEventListener("keyup", e => {
    inputChangeListener(e);
})

document.querySelector(".showPassword").addEventListener("click", e => revealPasswordLogic(e));

document.querySelector(".prijava-form").addEventListener("submit", async e => {
    e.preventDefault();

    try {
        const formData = new FormData(document.querySelector(".prijava-form"));
        const data = Object.fromEntries(formData);

        const res = await fetch("/prijava", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(data)
        })

        const resObj = await res.json();

        if (res.status === 200) {
            localStorage.setItem("userId", resObj.userId);

            window.location.href = "/";
        } else if (res.status === 401) {
            setStatusMessage("active", "fail", resObj.message);
        } else {
            throw new Error();
        }
    } catch (err) {
        console.log(err);
    }
})



