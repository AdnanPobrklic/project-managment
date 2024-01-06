import { setStatusMessage } from "./script.js";

const messagesContainer = document.querySelector(".messages-container");
const currentUrl = window.location.href;
const queryParamId = currentUrl.substring(currentUrl.lastIndexOf('/') + 1);
const userId = localStorage.getItem("userId");

window.onload = adjustMessageContainerScroll();
window.onload = hideUserListMob();
window.onload = changeMsgIcon();

const socket = io();


// Join room

socket.on('connect', () => {
    // Join room
    socket.emit("joinChatRoom", { reciverId: queryParamId });
});

socket.on("log-in-message", message => {
    document.querySelectorAll(".korisnici-li").forEach(korisnik => {
        if(message.statusKorisnika.includes(korisnik.dataset.id)){
            korisnik.children[1].textContent = "(online)";
            korisnik.children[1].classList.add("active");
        }else{
            korisnik.children[1].textContent = "(offline)";
            korisnik.children[1].classList.remove("active");
        }
    })
})

socket.on("log-out-message", message => {

    document.querySelectorAll(".korisnici-li").forEach(korisnik => {
        if(message.statusKorisnika.includes(korisnik.dataset.id)){
            korisnik.children[1].textContent = "(offline)";
            korisnik.children[1].classList.remove("active");
        }
    })
})


socket.on("message", message => {
    const { msg, isSeen } = message;
    outputMessage(msg, isSeen);
})

socket.on("user-join-message", message => {

    let seenStatusElements = document.querySelectorAll('.seen-status > i.fa-solid.fa-check');

    seenStatusElements.forEach(element => {
        element.classList.remove('fa-check');
        element.classList.add('fa-check-double');
    });        
})

document.querySelector("form").addEventListener("submit", (e) => {
    if(document.querySelector('#message').value != ""){
        formEventListener(e, socket);
    }
});

document.querySelector('#message').addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && e.target.value != "") {
        formEventListener(e, socket);
    }
});

function formEventListener(e, socket){
    e.preventDefault();

    const message = document.querySelector("#message");

    socket.emit("chatMessage", {sender_id: userId, receiver_id: queryParamId, text: message.value});

    message.value = "";
    message.focus();
}

function outputMessage(message, isSeen){
    const p = document.createElement("p");
    const spanInfo = document.createElement("spanInfo");

    p.textContent = message.text; 
    spanInfo.textContent = `${message.time}`;

    if(message.reciverId == queryParamId){
        p.classList.add("message-outcom");
        const spanSeen = document.createElement("spanInfo");
        const i = document.createElement("i");

        i.classList.add("fa-solid");
        i.classList.add(isSeen ? "fa-check-double" : "fa-check");
        spanSeen.classList.add("seen-status");
        
        spanSeen.appendChild(i);
        p.appendChild(spanSeen);
    }

    spanInfo.classList.add("msg-info");
    p.classList.add("message");
    p.appendChild(spanInfo);
    messagesContainer.appendChild(p);

    adjustMessageContainerScroll();
}

document.querySelector("#search").addEventListener("keyup", e => {
    const searchItems = document.querySelectorAll(".search-item");

    searchItems.forEach(item => {
        if(!item.innerText.toLowerCase().includes(e.target.value.toLowerCase())){
            item.style.display = "none"
        }else{
            item.style.display = "block"
        }
    })
})

document.querySelector("#clearConvo").addEventListener("click", async e => {
    try{
        const res = await fetch(`/razgovori/obrisi-razgovor/${queryParamId}`, {
            method: "DELETE",
            credentials: "include"
        });
        
        const resObj = {status: res.status, message: (await res.json()).message};

        if(resObj.status === 200){
            setStatusMessage("active", "success", resObj.message);
            setTimeout(() => {
                window.location.reload();    
            }, 750);
        }else{
            throw new Error();
        }
    }catch(err){
        console.log(err);
        alert("Nešto je krenulo po zlu");
    }
})

document.querySelector("#close-users-list").addEventListener("click", e => {
    document.querySelector(".users-container").classList.add("inactive");
    document.querySelector(".outter-container").classList.add("single-col");
    document.querySelector(".fa-address-book").classList.add("active");
})

document.querySelector(".fa-address-book").addEventListener("click", e => {
    document.querySelector(".fa-address-book").classList.remove("active");
    document.querySelector(".users-container").classList.remove("inactive");
    document.querySelector(".outter-container").classList.remove("single-col");
})

function adjustMessageContainerScroll(){
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}


function changeMsgIcon(){
    if(document.querySelector(".new-chat-notification") != null){
        document.querySelector(".new-chat-notification").remove();
        const i = document.createElement("i");
        i.classList.add("fa-solid");
        i.classList.add("fa-comments");
        document.querySelector("#poruke-icon").appendChild(i); 
    } 
}

function hideUserListMob() {
    if (window.matchMedia("(max-width: 1000px)").matches) {
        document.querySelector(".users-container").classList.add("inactive");
        document.querySelector(".outter-container").classList.add("single-col");
        document.querySelector(".fa-address-book").classList.add("active");
    }
}