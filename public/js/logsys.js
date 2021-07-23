//Log in system
(function () {
    'use strict'

    let uname = document.getElementById('uname')
    let pass = document.getElementById('pass')
    let email = document.getElementById('email')
    if (uname) {
        uname.focus()
    } else if (pass) {
        pass.focus()
    } else {
        email.focus()
    }

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    let forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }
                form.classList.add('was-validated')
            }, false)
        })
})()
