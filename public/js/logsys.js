//Log in system
(function () {
    'use strict'

    document.getElementById('email').focus()
    //document.getElementById('uname').focus()
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

/*
$(document).ready(function() {
    //Back form
    $("#back1").click(function () {
        $("#status").slideUp("fast");
        $("#input2").slideUp("fast");
        $("#input").delay(100).toggle("slide,fast");
    });
    $("#back2").click(function () {
        $("#status").slideUp("fast");
        $("#input1").slideUp("fast");
        $("#input").delay(100).toggle("slide,fast");
    });

    //Identification
    $("#step1").click(function () {


                else if (data['num'] == '1_1')
                {
                    $("#input")
                        .toggle("slide,fast");
                    $("#status")
                        .hide()
                        .removeClass()
                        .addClass("alert alert-info")
                        .html(data['msg'])
                        .delay(300)
                        .slideDown("fast");
                    $("#input1").delay(300).slideDown("fast");
                    $("#emailtglogin").val(email);
                    $("#cp").insertBefore("#logbtns").delay(300).slideDown("fast");
                    $("#login-pass").show();
                    $("#act").hide();
                    $("#code-resend").hide();
                    grecaptcha.reset();
                    setTimeout(function() { $("#passlogin").focus() }, 500);
                }
                else if (data['num'] == '1_2')
                {
                    $("#input")
                        .toggle("slide,fast");
                    $("#status")
                        .hide()
                        .removeClass()
                        .addClass("alert alert-info")
                        .html(data['msg'])
                        .delay(300)
                        .slideDown("fast");
                    $("#input1").delay(300).slideDown("fast");
                    $("#emailtglogin").val(email);
                    $("#login-pass").hide();
                    $("#act").show();
                    $("#code-resend").show();
                    $("#cp").hide();
                    setTimeout(function() { $("#code").focus() }, 500);
                }
                else if (data['num'] == '2')
                {
                    $("#input")
                        .toggle("slide,fast");
                    $("#status")
                        .hide()
                        .removeClass()
                        .addClass("alert alert-info")
                        .html(data['msg'])
                        .delay(300)
                        .slideDown("fast");
                    $("#input2").delay(300).slideDown("fast");
                    $("#emailtgreg").val(email);
                    $("#cp").insertBefore("#regbtns").delay(300).slideDown("fast");
                    grecaptcha.reset();
                    setTimeout(function() { $("#uname").focus() }, 500);
                }
                else if (data['num'] == '2_1')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-warning")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                }
                else if (data['num'] == '3')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-warning")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                }
            }
        });
    });

    //Registration
    $("#register").click(function () {

        $("#status")
            .show()
            .removeClass()
            .addClass("alert alert-info")
            .html($("#waiting").html());

        $("#register").prop('disabled', true);

        var email = $('#emailtgreg').val();
        var uname = $('#uname').val();
        var pass = $('#pass').val();
        var cpass = $('#cpass').val();
        var shapass = hex_sha512(pass);
        var recaptcha = grecaptcha.getResponse();

        $.ajax({
            url: 'inc/ajax/ajax_register.php',
            type: 'POST',
            data: {email: email, uname: uname, pass: pass, cpass: cpass, shapass: shapass, recaptcha: recaptcha, },
            dataType: 'json',
            success:function (data) {
                $("#register").prop('disabled', false);
                if (data['num'] == '0')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-danger")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                    grecaptcha.reset();
                }
                else if (data['num'] == '1')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-danger")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                    grecaptcha.reset();
                }
                else if (data['num'] == 'u1')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-danger")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                    grecaptcha.reset();
                }
                else if (data['num'] == '2')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-danger")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                    grecaptcha.reset();
                }
                else if (data['num'] == '3')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-danger")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                    grecaptcha.reset();
                }
                else if (data['num'] == '4')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-danger")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                    grecaptcha.reset();
                }
                else if (data['num'] == '5')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-danger")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                    grecaptcha.reset();
                }
                else if (data['num'] == '6')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-warning")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                    grecaptcha.reset();
                }
                else if (data['num'] == '7')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-warning")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                    grecaptcha.reset();
                }
                else if (data['num'] == 'c0')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-danger")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                    grecaptcha.reset();
                }
                else if (data['num'] == '-1')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-warning")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                    grecaptcha.reset();
                }
                else if (data['num'] == 'c1')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-danger")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                    grecaptcha.reset();
                }
                else if (data['num'] == '8')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-success")
                        .html(data['msg']);
                    $("#input2")
                        .toggle("slide,fast");
                    $("#input")
                        .delay(400)
                        .slideDown();
                    grecaptcha.reset();
                }
            }
        });
    });

    //Authentication
    $("#login").click(function () {

        var email = $('#emailtglogin').val();
        var pass = $('#passlogin').val();
        var code = $('#code').val();
        var shapass = hex_sha512(pass);
        var recaptcha = grecaptcha.getResponse();

        $.ajax({
            url: 'inc/ajax/ajax_login.php',
            type: 'POST',
            data: {email: email, pass: pass, shapass: shapass, recaptcha: recaptcha, code: code, },
            dataType: 'json',
            success:function (data) {
                if (data['num'] == '0')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-danger")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                    grecaptcha.reset();
                }
                else if (data['num'] == '2')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-warning")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                    grecaptcha.reset();
                }
                else if (data['num'] == '3')
                {
                    window.location.reload();
                }
                else if (data['num'] == '4')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-danger")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                    grecaptcha.reset();
                }
                else if (data['num'] == '4_trigger')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-danger")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                    $("#cp").insertBefore("#logbtns").delay(300).slideDown("fast");
                    grecaptcha.reset();
                }
                else if (data['num'] == '5')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-warning")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                    grecaptcha.reset();
                }
                else if (data['num'] == '6')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-danger")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                    grecaptcha.reset();
                }
                else if (data['num'] == '7')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-danger")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                    grecaptcha.reset();
                }
                else if (data['num'] == 'c0')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-danger")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                    grecaptcha.reset();
                }
                else if (data['num'] == 'c1')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-danger")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                    grecaptcha.reset();
                }
            }
        });
    });

    //Resend invitation code
    $(".resend").click(function () {
        $("#input1").slideUp("fast");
        $("#input").delay(100).toggle("slide,fast");
        $("#status")
            .show()
            .removeClass()
            .addClass("alert alert-info")
            .html($("#waiting").html());
        var email = $('#emailtglogin').val();
        $.ajax({
            url: 'inc/ajax/ajax_resend.php',
            type: 'POST',
            data: {email: email, },
            dataType: 'json',
            success:function (data) {
                if (data['num'] == '2')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-warning")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                }
                else if (data['num'] == '-1')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-warning")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                }
                else if (data['num'] == '0')
                {
                    $("#status")
                        .show()
                        .removeClass()
                        .addClass("alert alert-success")
                        .html(data['msg'])
                        .effect("shake", {times: 2, distance: 5}, 100);
                }
            }
        });
    });
});
*/
