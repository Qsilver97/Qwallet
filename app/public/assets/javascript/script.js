$(document).ready(() => {
    $("#login-form span").click(() => {
        $("#login-form span").toggleClass("fa-eye fa-eye-slash");
        const iconElem = $("#login-form span")
        const inputElem = $("#password");
        if (iconElem.attr('class') == 'fa fa-eye') {
            inputElem.attr('type', 'password');
        }
        if (iconElem.attr('class') == 'fa fa-eye-slash') {
            inputElem.attr('type', 'text');
        }
    })
})

// function logout() {
//     socket.emit('broadcast', { command: 'start', message: "Restart the server!" })
//     const form = document.createElement('form');
//     form.method = 'POST';
//     form.action = 'logout';
//     document.body.appendChild(form);
//     form.submit();
// }

function copyTextContent(element) {
    // Check if the clipboard API is available
    if (navigator.clipboard && window.isSecureContext) {
        // Use the Clipboard API (modern approach)
        navigator.clipboard.writeText(element.value)
            .then(() => {
                console.log("Content copied to clipboard");
                Toastify({
                    text: "Seeds copied to clipboard.",
                    className: "success",
                    style: {
                        background: "#5468ff",
                        color: "white",
                    }
                }).showToast();
            })
            .catch((error) => {
                console.error("Copy failed", error);
            });
    } else {
        // Fallback for older browsers
        element.select(); // Select the text inside the input
        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Fallback: Copying text command was ' + msg);
            Toastify({
                text: "Seeds copied to clipboard.",
                className: "success",
                style: {
                    background: "#5468ff",
                    color: "white",
                }
            }).showToast();
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
    }
}

function copyText(text) {
    // Check if the clipboard API is available
    if (navigator.clipboard && window.isSecureContext) {
        // Use the Clipboard API (modern approach)
        navigator.clipboard.writeText(text)
            .then(() => {
                console.log("Content copied to clipboard");
                Toastify({
                    text: "Address copied to clipboard.",
                    className: "success",
                    style: {
                        background: "#5468ff",
                        color: "white",
                    }
                }).showToast();
            })
            .catch((error) => {
                console.error("Copy failed", error);
            });
    } else {
    }
}
