const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");

const signUpButton = document.getElementById("signup");
const bucketForm = document.getElementById("bucketForm");
let bucketFormContainer = document.getElementById("bucketFormContainer")
const registerUsername = document.getElementById("registerUsername");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const bucketsDiv = document.getElementById("buckets");
const headerDiv = document.getElementById("header");

window.addEventListener("load", ()=>{
    fetch("http://localhost:3000/verify")
        .then((res)=>{
            console.log(res)
            if(res.ok){
                // registerForm.style.display = "none";
                // loginForm.style.display = "none"
                alert("User verified")
                return res.json();
            }
        })
        .then((jsonObj)=>{
                bucketFormContainer.style.display = "block"
                signUpButton.style.display = "none";
                let createLogOutDiv = document.createElement("div");
                let createWelcomeButton = document.createElement("p");
                createWelcomeButton.innerHTML = `Welcome, ${localStorage.getItem("username")}`;
                let createLogOutButton = document.createElement("button");
                createLogOutButton.innerHTML = "LogOut";
                
                createLogOutDiv.appendChild(createWelcomeButton);
                createLogOutDiv.appendChild(createLogOutButton);
                headerDiv.appendChild(createLogOutDiv)
                createLogOutDiv.className = "welcome"

                createLogOutButton.addEventListener("click", ()=>{
                    fetch("http://localhost:3000/logout")
                        .then((res)=>{
                            if(res.ok){
                                alert("Log out successfully");
                                location.reload();
                            }
                            
                        })
                        .catch((err)=>{
                            console.log(err);
                        })
                })
                while(bucketsDiv.hasChildNodes()){
                    bucketsDiv.removeChild(bucketsDiv.lastChild)
                }
            if(jsonObj.bucket){
                bucketFormContainer.style.display = "none"
                let createBucketDiv = document.createElement("div");
                let createBucketH = document.createElement("h1");
                let createDeleteButton = document.createElement("button");
                
                let bucketName = jsonObj.bucket.split("-")[0];
                createBucketH.innerHTML = bucketName;
                createDeleteButton.innerHTML = "Delete Bucket"
                createBucketDiv.appendChild(createBucketH);
                createBucketDiv.appendChild(createDeleteButton);
                bucketsDiv.appendChild(createBucketDiv);

                addBucketName();
                if(jsonObj.files){
                    addBucketFileList(jsonObj.files, jsonObj.bucket);
                }


                createDeleteButton.addEventListener("click", ()=>{
                    // let data = {bucket: createBucketH.innerHTML};
                    fetch("http://localhost:3000/delete-bucket", {
                        method: "DELETE",
                        headers:{
                            "Content-Type" : "application/json"
                        }
                    })
                    .then((res)=>{
                        if(res.ok){
                            alert("Bucket deleted");
                            location.reload()
                        }
                    })
                    .catch((err)=>{
                        console.log(err);
                    })
                })
            }
        })
        .catch((err)=>{
            console.log(err)
        })
})


const addBucketFileList = function(files, bucketName){
    console.log(files)
    for(let i = 0; i<files.length; i++){
        let createFileDiv = document.createElement("div");
        let createFileName = document.createElement("h2");
        let createDeleteButton = document.createElement("button");
        let lastDot = files[i].file.lastIndexOf(".")
        let fileEndName = files[i].file.slice(lastDot + 1);
        fileEndName = fileEndName.toLowerCase()
        let createFile;
        switch(fileEndName){
            case "txt":
            case "pdf": createFile = document.createElement("a");
                        createFile.innerHTML = "Click to view your PDF"
                        createFile.href =  `https://${bucketName}.s3.eu-west-1.amazonaws.com/${files[i].file}`
                        break;
            case "png":
            case "jpg":
            case "jpeg": createFile = document.createElement("img");
                         createFile.src = `https://${bucketName}.s3.eu-west-1.amazonaws.com/${files[i].file}`
                         break; 
        }
        createFileName.innerHTML = files[i].file.split("-")[1];
        createFileName.id = files[i].file
        createDeleteButton.innerHTML = "Delete this object"
        createFileDiv.appendChild(createFileName);
        createFileDiv.appendChild(createFile)
        createFileDiv.appendChild(createDeleteButton);
        bucketsDiv.appendChild(createFileDiv);

        createDeleteButton.addEventListener("click", (event)=>{
            let name = event.target.parentElement;
            let fileName = {file: name.children[0].id};
            fetch("http://localhost:3000/delete-object", {
                headers:{
                    "Content-Type":"application/json"
                },
                method: "DELETE",
                body: JSON.stringify(fileName)
            })
            .then((res)=>{
                if(res.ok){
                    alert("Object deleted")
                }
            })
            .catch((err)=>{
                console.log(err);
            })
        })
    }

}



const addBucketName = function(){
    let createDiv = document.createElement("div");
    let createH = document.createElement("h1");
    let createFileButton = document.createElement("input");
    let createButton = document.createElement("button");
    let createForm = document.createElement("form");


    createH.innerHTML = "Upload file to your bucket";
    createFileButton.type = "file";
    createFileButton.name = "file";
    createButton.innerHTML = "Upload!";

    createForm.appendChild(createH);
    createForm.appendChild(createFileButton);
    createForm.appendChild(createButton);
    createDiv.appendChild(createForm)
    bucketsDiv.appendChild(createDiv);


    createForm.addEventListener("submit", (e)=>{
        e.preventDefault();
        const formData = new FormData(createForm);
        fetch("http://localhost:3000/upload-file", {
            method: "POST",
            body: formData
        })
        .then((res)=>{
            console.log(res);
            if(res.ok){
                alert("Uploaded")
            }
        })
        .catch((err)=>{
            console.log(err);
        })
    })
}


registerForm.addEventListener("submit", (e)=>{
    e.preventDefault()
    const userDetails = {
        username: registerUsername.value,
        email: registerEmail.value,
        password: registerPassword.value
    }

    fetch("http://localhost:3000/register", {
        method: "POST",
        body: JSON.stringify(userDetails),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then((res)=>{
        if(res.ok)
            alert("Register succeed")
    })
    .catch((err)=>{
        console.log(err);
    })
})


//Login Elements

const loginUsername = document.getElementById("loginUsername");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

loginForm.addEventListener("submit", (e)=>{
    e.preventDefault()
    const userDetails = {
        username: loginUsername.value,
        email: loginEmail.value,
        password: loginPassword.value
    }

    fetch("http://localhost:3000/login", {
        method: "POST",
        body: JSON.stringify(userDetails),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then((res)=>{
        console.log("------")
        console.log(res)
        console.log("@@@@@")
        if(res.ok){
            alert("Login succeed")
            return res.json();
        }
    })
    .then((jsonObj)=>{
        localStorage.setItem("username", jsonObj.username)
        alert("name set localstorage")
        location.reload()
    })
    .catch((err)=>{
        console.log(err);
    })
})



// Create bucket elements

const bucketName = document.getElementById("bucketName");

bucketForm.addEventListener("submit", (e)=>{
    e.preventDefault()
    const bucketDetails = { bucketname : bucketName.value, username: localStorage.getItem("username")};

    fetch("http://localhost:3000/create-bucket", {
        method: "POST",
        body: JSON.stringify(bucketDetails),
        headers:{
            "Content-Type": "application/json"
        }
    })
    .then((res)=>{
        if(res.ok){
            alert("Bucket created")
            location.reload()
        }
    })
    .catch((err)=>{
        console.log(err)
    })
})



const register = document.getElementById("register");
const signupHeader = document.getElementById("signup")
const registerSignInButton = document.getElementById("registersignin");
const login = document.getElementById("login");


registerSignInButton.addEventListener("click", ()=>{
    register.style.display = "none";
    login.style.display = "block"

})
signUpButton.addEventListener("click", ()=>{
        register.style.display = "block";
})


window.addEventListener("click", (event)=>{
    if(event.target !== signupHeader && event.target.parentElement !== registerForm && event.target !== registerForm && event.target.parentElement !== loginForm && event.target !== loginForm){
        register.style.display = "none"
        login.style.display = "none"
    }
    else{
        if(loginForm.style.display == "none"){
            register.style.display = "block"
        }
    }
})