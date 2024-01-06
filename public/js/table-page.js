import { setStatusMessage } from "./script.js";

const searchColumnFirst = document.querySelectorAll(".kolona-search-first");
const searchColumnSecond = document.querySelectorAll(".kolona-search-second");
const searchBar = document.querySelector("#search");

searchBar.addEventListener("input", e => {
    if(e.target.value){
        searchColumnFirst.forEach((text, index) => {
            let fullSearchableText;

            if(searchColumnSecond.length > 0){
                fullSearchableText = (text.textContent) + " " + searchColumnSecond[index].textContent;
            }else{
                fullSearchableText = text.textContent;
            }

            if(fullSearchableText.toLowerCase().includes(e.target.value.toLowerCase())){
                text.parentElement.classList.remove("hidden");
            }else{
                text.parentElement.classList.add("hidden");
            }
        })
    }else{
        searchColumnFirst.forEach(el => {
            el.parentElement.classList.remove("hidden");
        });
    }
})


if(document.querySelector("#slanje-izvjestaja-na-mail")){
    document.querySelector("#slanje-izvjestaja-na-mail").addEventListener("submit", async e => {
        e.preventDefault();
    
        document.querySelector(".loader").classList.add("active");
        
        try{
            const formData = new FormData(document.querySelector("#slanje-izvjestaja-na-mail"));
            const data = Object.fromEntries(formData);
            
            const res = await fetch("/radna-povrsina/radno-vrijeme/mailto/izvjestaj", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(data)
            });
            
            if(res.status == 200){
                document.querySelector(".loader").classList.remove("active");
                setStatusMessage("active", "success", "Izvještaj poslan na mail");
            }else{
                throw new Error();
            }
        }catch(err){
            document.querySelector(".loader").classList.remove("active");
            setStatusMessage("active", "fail", "Nešto je krenulo po zlu");
        }
    
    })
}

if(document.getElementById('radno-vrijeme-izvjestaj')){
    document.getElementById('radno-vrijeme-izvjestaj').addEventListener('change', function() {
        var form = document.querySelector('.radno-vrijeme-form');
        var izvjestaj = this.value;
        switch(izvjestaj) {
            case '0':
                form.action = "/radna-povrsina/radno-vrijeme/radnici/mjesecni/izvjestaj";
                break;
            case '1':
                form.action = "/radna-povrsina/radno-vrijeme/radnici/godisnji/izvjestaj";
                break;
            case '2':
                form.action = "/radna-povrsina/radno-vrijeme/radnici/ukupni/izvjestaj";
                break;
        }
    });
}

if(document.getElementById('prisustvoIzvjestaj')){
    document.getElementById('prisustvoIzvjestaj').addEventListener('change', function() {
        var form = document.querySelector('.prisustvo-form');
        var izvjestaj = this.value;
        switch(izvjestaj) {
            case '0':
                form.action = "/radna-povrsina/prisustvo/radnici/mjesecni/izvjestaj";
                break;
            case '1':
                form.action = "/radna-povrsina/prisustvo/radnici/godisnji/izvjestaj";
                break;
            case '2':
                form.action = "/radna-povrsina/prisustvo/radnici/ukupni/izvjestaj";
                break;
        }
    });
}

