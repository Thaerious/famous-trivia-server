// document.getElementById("name").focus()
//
// let loginForm = document.querySelector("#login-form");
// let passwordForm = document.querySelector("#password-form");
//
// /* override form submission, return false to avoid forwarding */
// function submit() {
//     let name = document.getElementById("name").value.trim();
//     let password = document.getElementById("password").value.trim();
//
//     console.log("'" + password + "'");
//     if (name === "host" && password.trim().length === 0){
//         document.querySelector("#login-form").classList.add("hidden");
//         document.querySelector("#password-form").classList.remove("hidden");
//         document.getElementById("password").focus()
//
//         return false;
//     }
//
//     let data = {
//         name : name,
//         password : password
//     }
//
//     let url = loginForm.getAttribute("action");
//
//     let request = new Request(url, {
//         method: "POST",
//         credentials: 'same-origin',
//         body: JSON.stringify(data),
//         headers: {
//             "Content-Type": "application/json"
//         }
//     });
//
//     fetch(request)
//         .then(function (response) {
//             response.json().then(json => onResponse(JSON.parse(json)));
//         })
//         .catch(function (err) {
//             console.log(err);
//             alert("ERROR: see console");
//         });
//
//     return false;
// };
//
// loginForm.onsubmit = submit;
// passwordForm.onsubmit = submit;
//
// function onResponse(json){
//     if (json.action === "success"){
//         window.location = "/pages/contestant_portal.html";
//     }
//     else if (json.action === "error") {
//         setMessage(json.text);
//     }
// }
//
// document.querySelector("#close-button").addEventListener("click", ()=>{
//     document.querySelector("#message-box").classList.add("hidden");
//     document.querySelector("#login-form").classList.remove("hidden");
// });
//
// function setMessage(text){
//     document.querySelector("#message-box").classList.remove("hidden");
//     document.querySelector("#message-text").textContent = text;
//     document.querySelector("#close-button").focus;
// }
//
// window.setMessage = setMessage;
//
