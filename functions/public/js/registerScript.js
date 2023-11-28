(() => {
    // Initialize Firebase
    var storageRef, photoURL;
    firebase.initializeApp(firebaseConfig);
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    storageRef = firebase.storage().ref();
    console.log("firebase configured");

    //code for firebase post
    $('#prevBtn').on('click', function() { nextPrev(-1); });
    $('#nextBtn').on('click', function() { nextPrev(1); });
    $('#submitBtn').on('click', function() { registerUser(); });

    function registerUser() {
        // event.preventDefault();
        console.log("form submitted");
        const display_name = $('input[name ="user_name"]').val();
        const email = $('input[name ="user_email"]').val();
        const password = $('input[name ="password"]').val();
        const confirmPassword = $('input[name ="cpassword"]').val();
        if (confirmPassword == password) {
            firebase
                .auth()
                .createUserWithEmailAndPassword(email, password)
                .catch(function(error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    // ...
                    window.alert(errorMessage);
                    // document.getElementById("errorDisplay").innerHTML = errorMessage;
                })
                .then(() => {
                    firebase
                        .auth()
                        .signInWithEmailAndPassword(email, password)
                        .then(({ user }) => {
                            firebase.auth().onAuthStateChanged(function(user_) {
                                if (user_) {
                                    // User_ is signed in.
                                    console.log(user_);
                                    user_.updateProfile({
                                        displayName: display_name,
                                        photoURL: photoURL
                                    }).then(function() {
                                        swal({
                                            text: "Success!",
                                            title: "User registeration successful",
                                            icon: "success",
                                            allowOutsideClick: false
                                        }).then((redirectToLogin) => {
                                            if (redirectToLogin) {
                                                window.location.assign("/login");
                                            } else {
                                                window.location.assign("/login");
                                            }
                                        });
                                    }).catch(function(error) {
                                        console.log(error);
                                    });
                                } else {
                                    console.log("user not logged in");
                                }
                            });
                        })
                })
                .then(() => {
                    return firebase.auth().signOut();
                })
        } else {
            window.alert("Password Does not Match");
        }
        return false;

    }

    var currentTab = 0; // Current tab is set to be the first tab (0)
    showTab(currentTab); // Display the current tab

    function showTab(n) {
        // This function will display the specified tab of the form ...
        var x = document.getElementsByClassName("tab");
        x[n].style.display = "block";
        // ... and fix the Previous/Next buttons:
        if (n == 0) {
            document.getElementById("prevBtn").style.display = "none";
        } else {
            document.getElementById("prevBtn").style.display = "inline";
        }
        if (n == (x.length - 1)) {
            // document.getElementById("nextBtn").innerHTML = "Submit";
            // document.getElementById("nextBtn").style.width = "150px";
            $('#submitBtn').show();
            $('#nextBtn').hide();
        } else {
            // document.getElementById("nextBtn").innerHTML = "<i class=\"fas fa-arrow-right\"></i>";
            // document.getElementById("nextBtn").style.width = "60px";
            $('#nextBtn').show();
            $('#submitBtn').hide();
        }
        // ... and run a function that displays the correct step indicator:
        fixStepIndicator(n)
    }

    function nextPrev(n) {
        // This function will figure out which tab to display
        var x = document.getElementsByClassName("tab");
        // Exit the function if any field in the current tab is invalid:
        if (n == 1 && !validateForm()) return false;
        // Hide the current tab:
        x[currentTab].style.display = "none";
        // Increase or decrease the current tab by 1:
        currentTab = currentTab + n;
        // if you have reached the end of the form... :
        if (currentTab >= x.length) {
            //...the form gets submitted:
            document.getElementById("regForm").submit();
            return false;
        }
        // Otherwise, display the correct tab:
        showTab(currentTab);
    }

    function validateForm() {
        // This function deals with validation of the form fields
        var x, y, i, valid = true;
        x = document.getElementsByClassName("tab");
        y = x[currentTab].getElementsByTagName("input");
        // A loop that checks every input field in the current tab:
        for (i = 0; i < y.length; i++) {
            // If a field is empty...
            if (y[i].value == "") {
                // add an "invalid" class to the field:
                y[i].className += " invalid";
                // and set the current valid status to false:
                valid = false;
            }
        }
        // If the valid status is true, mark the step as finished and valid:
        if (valid) {
            document.getElementsByClassName("step")[currentTab].className += " finish";
        }
        return valid; // return the valid status
    }

    function fixStepIndicator(n) {
        // This function removes the "active" class of all steps...
        var i, x = document.getElementsByClassName("step");
        for (i = 0; i < x.length; i++) {
            x[i].className = x[i].className.replace(" active", "");
        }
        //... and adds the "active" class to the current step:
        x[n].className += " active";
    }

    var input = document.querySelector('input[type=file]');

    input.onchange = function() {
        var file = input.files[0];

        var metadata = {
            'contentType': file.type
        };


        var uploadTask = storageRef.child("tempURLs/" + file.name).put(file, metadata);
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, function(snapshot) {}, function(error) {
            console.log(error)
        }, function() {
            console.log('Upload Completed');
            uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                console.log('File available at', downloadURL);
                photoURL = downloadURL;
            });
        });

        drawOnCanvas(file);
    };

    function drawOnCanvas(file) {
        var reader = new FileReader();

        reader.onload = function(e) {
            var dataURL = e.target.result,
                c = document.querySelector('canvas'),
                ctx = c.getContext('2d'),
                img = new Image();

            img.onload = function() {
                ctx.drawImage(img, 0, 0, img.width, img.height, // source rectangle
                    0, 0, c.width, c.height);
            };

            img.src = dataURL;
            console.log(dataURL);
        };

        reader.readAsDataURL(file);
    }

    $('#upload-btn').on('click', function() {
        $('#upload-btn-hidden').click();
    });

})();