import { setStatusMessage } from "./script.js"

const socket = io();

window.onload = function() {
    document.querySelector(".aktivnosti-sistema").scrollTop = 0;
    document.querySelector("#filter-aktivnost").value = "sve";
    if(!document.querySelector(".aktivnosti-sistema").children.length > 0){
        const li = document.createElement("li");
        li.textContent = "Nema unešenih aktivnosti";
        li.id = "no-activity-text";
        document.querySelector(".aktivnosti-sistema").appendChild(li);
    }
}


// Join room
socket.on('connect', () => {
    // Join room
    socket.emit("joinAktivnosti", localStorage.getItem("userId"));
});


// Join room
socket.on("log-in-message", msg => {

    if(document.querySelector(".online-korisnici h1")) document.querySelector(".online-korisnici h1").style.display = "none";

    const li = document.createElement("li");
    li.textContent = msg.imePrezimeKorisnika;

    let postojiLi = false;
    document.querySelectorAll(".online-korisnici li").forEach(li => {
        if(li.textContent == msg.imePrezimeKorisnika){
            postojiLi = true;
            return;
        }
    });

    if(!postojiLi) document.querySelector(".online-korisnici").appendChild(li);

})

socket.on("log-out-message", msg => {
    document.querySelectorAll(".online-korisnici li").forEach(li => {
        if(li.textContent == msg.imePrezimeKorisnika){
            li.remove();
            return;
        }
    });
})

socket.on("activity-notification", aktivnost => {
    if(document.querySelector("#no-activity-text")) document.querySelector("#no-activity-text").remove();

    const aktivnostSistemaUl = document.querySelector(".aktivnosti-sistema");

    const li = document.createElement("li");
    li.classList.add("aktivnost-sistema-li");

    const img = document.createElement("img");
    img.src = "/img/system-activity.png";
    img.alt = "aktivnost ikona";
    img.classList.add("activity-icon");
    li.appendChild(img);

    const span1 = document.createElement("span");
    span1.classList.add("li-item", "first-li-item");
    span1.innerHTML = `<span>Vrsta:</span> ${aktivnost.aktivnost.vrsta}`;
    li.appendChild(span1);

    const span2 = document.createElement("span");
    span2.classList.add("li-item");
    span2.innerHTML = `<span>Radnik</span>: ${aktivnost.korisnik.ime} ${aktivnost.korisnik.prezime}`;
    li.appendChild(span2);

    const time = new Date(aktivnost.aktivnost.time);
    const formattedTime = `${time.getFullYear()}-${padZero(time.getMonth() + 1)}-${padZero(time.getDate())} ${padZero(time.getHours())}:${padZero(time.getMinutes())}`;

    const span3 = document.createElement("span");
    span3.classList.add("li-item");
    span3.innerHTML = `<span>Vrijeme:</span> ${formattedTime}`;
    li.appendChild(span3);

    const trashIcon = document.createElement("i");
    trashIcon.classList.add("fa-solid", "fa-trash");
    li.appendChild(trashIcon);

    aktivnostSistemaUl.prepend(li);
});


document.querySelector(".activity-toggle").addEventListener("click", e => {
    toggleChange();
})

document.querySelector(".online-user-toggle").addEventListener("click", e => {
    toggleChange();
})

document.querySelector(".online-korisnici-section input").addEventListener("keyup", e => {
    document.querySelectorAll(".online-korisnici li").forEach(item => {
        if(item.textContent.toLowerCase().includes(e.target.value.toLowerCase())){
            item.classList.remove("inactive")
        }else{
            item.classList.add("inactive")
        }
    })
})

document.querySelector("#filter-aktivnost").addEventListener("change", e => {

    if(e.target.value != "sve"){
        document.querySelectorAll(".first-li-item").forEach(item => {
            console.log(item.textContent.toLocaleLowerCase().replace(/ /g,'').substring(7))
            if(item.textContent.toLocaleLowerCase().replace(/ /g,'').substring(7).includes(e.target.value.toLocaleLowerCase())){
                item.parentElement.classList.remove("hide-li")
            }else{
                item.parentElement.classList.add("hide-li")
            }
        })
    }else{
        document.querySelectorAll(".first-li-item").forEach(item => {
            item.parentElement.classList.remove("hide-li")
        }) 
    }
})
    


document.querySelectorAll(".fa-trash").forEach(item => {
    item.addEventListener("click", e => {
        fetch(`/radna-povrsina/aktivnosti/obrisi/${e.target.parentElement.dataset.id}`, {
            method: "DELETE",
            credentials: "include"
        }).then(res => {
            if(res.status){
                setStatusMessage("active", "success", "Aktivnost obrisana");
                setTimeout(() => {
                    window.location.reload();
                }, 1000)
            }else{
                setStatusMessage("active", "fail", "Nešto je krenulo po zlu");
            }
        }).catch(err => {
            console.log(err);
            alert("Nešto je krenulo po zlu");
        })
    })
})

function toggleChange(){
    document.querySelector(".aktivnost-sistema-section").classList.toggle("inactive");
    document.querySelector(".online-korisnici-section").classList.toggle("active");
    document.querySelector(".activity-toggle").classList.toggle("active");
    document.querySelector(".online-user-toggle").classList.toggle("active");
}

function padZero(num) {
    return num < 10 ? `0${num}` : num;
}