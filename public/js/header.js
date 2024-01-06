import { setStatusMessage } from "./script.js";

const toggleDropdown = document.querySelectorAll(".toggle-dropdown");
const dropdownContainer = document.querySelectorAll(".dropdown-container");
const carets = document.querySelectorAll(".caret");
const logOutBtn = document.querySelector("#logOutBtn");
const menuToggle = document.querySelector(".toggle-menu");

window.onload = () => {
    if(document.querySelector(".notification-container")){
        if(!document.querySelector(".notification-container").children.length > 0) {
            const li = document.createElement("li");
            li.textContent = "Nemate notifikacija";
            li.classList.add("empty-container-text")
            document.querySelector(".notification-container").appendChild(li);
        }
    }
}

const socket = io();

socket.on('connect', () => {

    socket.emit("online");
    socket.emit("joinMyRoom", localStorage.getItem("userId"));

    setInterval(() => {
        socket.emit("ping");
    }, 5000);
    
}); 

socket.on('notification', msg => {

    let unseenNotificationsNum = parseInt(document.querySelector(".unseen-notifications").textContent);

    if(document.querySelector(".empty-container-text")) document.querySelector(".empty-container-text").remove();
    
    unseenNotificationsNum++;
    document.querySelector(".unseen-notifications").textContent = unseenNotificationsNum;
    document.querySelector(".unseen-notifications").classList.remove("inactive");

    const p = document.createElement("p");

    const textNode = document.createTextNode(msg.content);

    const img = document.createElement("img");
    img.setAttribute("src", "/img/notification-p-icon.png");
    img.setAttribute("alt", "notification-icon");

    const span = document.createElement("span");
    const vrijemeObavijesti = new Date(msg.time);
    const updateVrijeme = () => {
        const trenutnoVrijeme = new Date();
        const razlikaUMinutama = Math.floor((trenutnoVrijeme - vrijemeObavijesti) / 60000);
        span.textContent = razlikaUMinutama > 0 ? `prije ${razlikaUMinutama} minuta` : 'upravo sada';
    };
    updateVrijeme();
    setInterval(updateVrijeme, 60000); 

    p.prepend(img);
    p.prepend(span);
    p.appendChild(textNode);

    document.querySelector(".notification-container").prepend(p);
});


if(document.querySelector(".notification-toggle")){
    document.querySelector(".notification-toggle").addEventListener("click", e => {
        fetch("/radna-povrsina/obavjesti/ocisti-obavjesti", {
            method: "POST",
            credentials: "include"
        }).then( () => {
            document.querySelector(".unseen-notifications").textContent = "0";
            document.querySelector(".unseen-notifications").classList.add("inactive");
        }).catch(err => {
            console.log(err);
            alert("Obavjesti nisu očisčene")
        })
    
        const container = document.querySelector(".notification-container");
        container.scrollTop = 0;
        container.classList.toggle("active");
    })
}

socket.on('chat-notification', msg => {
    const userLi = document.querySelector(`[data-id="${msg.receiver_id}"]`);
    setStatusMessage("active", "neutral", msg.text);
    document.querySelector(".neutral").addEventListener("click", e => {
        window.location.href = `/radna-povrsina/poruke/${msg.receiver_id}`
    })
    if(userLi){
        const img = document.createElement("img");
        img.src = "/img/notification.png";
        img.alt = "notification icon";
        img.classList.add("new-message-icon");
        userLi.appendChild(img);
    }else{
        const uTag = document.querySelector('#poruke-icon');
        while(uTag.firstChild){
            uTag.removeChild(uTag.firstChild);
        }
        const img = document.createElement("img");
        img.src = "/img/new-chat.png";
        img.alt = "new message icon";
        img.classList.add("new-chat-notification");
        uTag.appendChild(img);
    }
});

menuToggle.addEventListener("click", e => {
    document.querySelector("nav").classList.toggle("inactive");
    document.querySelector(".page").classList.toggle("active");
})

logOutBtn.addEventListener("click", async e => {
    try {
        const response = await fetch("/radna-povrsina/odjava", {
            method: "POST",
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("Greška prilikom odjave");
        }

        window.location.reload();
    } catch (err) {
        alert(err.message);
        console.log(err);
    }
});

toggleDropdown.forEach((element, index) => {
    element.addEventListener("click", e => {
        dropdownContainer[index].classList.toggle("active");
        carets[index].classList.toggle("fa-caret-right");
        carets[index].classList.toggle("fa-caret-down");
    })
})

