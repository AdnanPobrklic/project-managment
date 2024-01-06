function revealPasswordLogic(e){
    const inputField = e.target.previousElementSibling; 

    if(inputField.type === "password"){
        e.target.classList.toggle("fa-eye");
        e.target.classList.toggle("fa-eye-slash");
        inputField.type = "text";
    }else{
        e.target.classList.toggle("fa-eye");
        e.target.classList.toggle("fa-eye-slash");
        inputField.type = "password";
    }
}

function inputChangeListener(e){
    if(e.target.value != ""){
        e.target.nextElementSibling.classList.add("active");
    }else{
        e.target.nextElementSibling.classList.remove("active");
    }
}

function setStatusMessage(addedClass, addedClass2, message){
    document.querySelector(".display-message").classList.add(addedClass);
    document.querySelector(".display-message").classList.add(addedClass2);
    document.querySelector(".display-message").textContent = message;
    setTimeout(() => {
        document.querySelector(".display-message").classList.remove(addedClass);
        document.querySelector(".display-message").classList.remove(addedClass2);
    }, 3500)
}

export {
    revealPasswordLogic,
    inputChangeListener,
    setStatusMessage
}