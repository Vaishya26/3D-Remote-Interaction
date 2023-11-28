(() => {
    // $('#update-form').parsley();
    // for input 
    $(".field-wrapper .field-placeholder").on("click", function() {
        $(this).closest(".field-wrapper").find("input").focus();
    });


    $(function() {

        $('#releasesDiv').on('click', function() { window.location.href = '/releases' });
        $('#supportDiv').on('click', function() { window.location.href = '/support' });
        $('#editorDiv').on('click', function() { window.location.href = '/createscene' });
        $('#updateFormDiv').on('click', function() { window.location.href = '/push_update' });

        // accordion toggle collapse
        $('.project-accordion [data-toggle="collapse"]').on('click', function() {
            $(this).find('.toggle-icon').toggleClass('fa-minus-circle fa-plus-circle');
        });

        $('.collapse').collapse('hide');

        $('.dropify').dropify();

        $('#update-type').on('change', function() {
            if ($('#update-type').val() == 'feature') {
                $('.git-div').show();
                $('.file-div').hide();
            } else if ($('#update-type').val() == 'apk') {
                $('.git-div').hide();
                $('.file-div').show();
            } else {
                $('.git-div').hide();
                $('.file-div').hide();
            }
        })
    })

    // main js script
    var date = new Date();
    var hour = date.getHours();
    if (hour < 12) {
        $("#greeting").text("Good Morning");
    } else if (hour < 17) {
        $("#greeting").text("Good Afternoon");
    } else {
        $("#greeting").text("Good Evening");
    }

    $('#homepageDiv').on('click', function() { window.location.href = '/dashboard' });

    $(document).mouseup(function(e) {
        var container = $(".editDiv");
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            container.hide();
        }
    });

    var displayName, email, photoURL, isAdmin;
    var database, uid, storageRef;
    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    storageRef = firebase.storage().ref();
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            console.log(user);
            displayName = user.displayName;
            email = user.email;
            isAdmin = (email == 'ajnasuite@ajnalens.com');
            if (isAdmin) $('#updateFormDiv').css("display", "block");
            var emailVerified = user.emailVerified;
            photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            uid = user.uid;
            var providerData = user.providerData;
            console.log(displayName);
            $('#user_name').append(displayName);
            $('#user-info-name b').text(displayName);
            $('#user-info-email b').text(email);
            $('#user_img').attr('src', photoURL);
        } else {
            console.log("user not logged in");
            firebase.auth().signOut().then(() => {
                window.location.assign("/logout");
            });
        }
    });

    $('#logoutDiv').on('click', function() {
        firebase.auth().signOut().then(() => {
            window.location.assign("/logout");
        });
    })

    $('#submit-btn').on('click', function() {
        var formData = [$('#update-type').val(), $('#proj-name').val(), $('#version-num').val(), $('#update-desc').val()];

        if (formData.includes("")) {
            swal(
                'Form incomplete',
                'Fill all the fields before submitting',
                'warning'
            ).catch(swal.noop);
        } else if (($('#update-type').val() == "feature") && ($('#git-link').val() == "")) {
            swal(
                'Form incomplete',
                'Fill all the fields before submitting',
                'warning'
            ).catch(swal.noop);
        } else if (($('#update-type').val() == "apk") && ($('#file-inp')[0].files.length == 0)) {
            swal(
                'Form incomplete',
                'Fill all the fields before submitting',
                'warning'
            ).catch(swal.noop);
        } else {
            var data = {
                type: formData[0],
                proj_name: formData[1],
                version: formData[2],
                desc: formData[3]
            };

            let d = new Date();
            let cur_date = d.getFullYear() + "_" + (d.getMonth() + 1) + "_" + d.getDate() + "_" + d.getHours() + "_" + d.getMinutes();

            if (data.type == "feature") {
                data['git_link'] = $('#git-link').val();

                // database.ref('releases/' + new Date().toLocaleString().replaceAll("/", "_")).update(data, function (error) {
                database.ref('releases/' + cur_date).update(data, function(error) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log("Data updated on firebase");
                        $('#update-form').trigger('reset');

                        swal(
                            'Success!',
                            'Update released successfully',
                            'success'
                        ).catch(swal.noop);
                    }
                });
            } else {
                var file = document.querySelector('#file-inp').files[0];
                var metadata = {
                    'contentType': file.type
                };

                var uploadTask = storageRef.child('updates/' + file.name).put(file, metadata);

                uploadTask
                    .then(snapshot => snapshot.ref.getDownloadURL())
                    .then((url) => {
                        data['file_link'] = url;
                        data['file_name'] = file.name;
                        database.ref('releases/' + cur_date).update(data, function(error) {
                            // database.ref('releases/2020_12_15_12_20').update(data, function (error) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log("Data updated on firebase");
                                $('#update-form').trigger('reset');
                                swal(
                                    'Success!',
                                    'Update released successfully',
                                    'success'
                                ).catch(swal.noop);
                            }
                        });
                    })
                    .catch(console.error);
            }


        }
    });

})();