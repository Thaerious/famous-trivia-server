function onSuccess(googleUser) {
    console.log('Logged in as: ' + googleUser.getBasicProfile().getName());

    let user = gapi.auth2.getAuthInstance().currentUser.get();
    let hasScopes = user.hasGrantedScopes('https://www.googleapis.com/auth/drive.appdata');

    if (!hasScopes) {
        const options = new gapi.auth2.SigninOptionsBuilder();
        options.setScope('https://www.googleapis.com/auth/drive.appdata');

        googleUser = gapi.auth2.getAuthInstance().currentUser.get();
        googleUser.grant(options).then(
            function (success) {
                enableButtons();
                window.main();
            },
            function (fail) {
                alert(JSON.stringify({message: "fail", value: fail}));
            });
    } else {
        enableButtons();
        window.main();
    }
}

function enableButtons(){
    document.querySelectorAll(".home-option").forEach(e=>e.classList.remove("disabled"));
}

function disableButtons(){
    document.querySelectorAll(".home-option").forEach(e=>e.classList.add("disabled"));
}

function onFailure(error) {
    console.log(error);
}

function renderButton() {
    gapi.signin2.render('sign-in', {
        'scope': 'profile email',
        'width': 240,
        'height': 50,
        'longtitle': true,
        'theme': 'dark',
        'onsuccess': onSuccess,
        'onfailure': onFailure
    });
}

function signOut(){
    disableButtons();
    gapi.auth2.getAuthInstance().signOut();
}