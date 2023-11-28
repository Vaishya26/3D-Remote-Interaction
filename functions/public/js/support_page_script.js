(() =>{
// for input 
$(".field-wrapper .field-placeholder").on("click", function () {
    $(this).closest(".field-wrapper").find("input").focus();
});

$('#homepageDiv').on('click', function () { window.location.href = '/dashboard' });

$(document).mouseup(function (e) {
    var container = $(".editDiv");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.hide();
    }
});

$('#releasesTabs a').on('click', function (event) {
    event.preventDefault()
    $(this).tab('show');
});

var database, uid, storageRef, displayName, email, photoURL, isAdmin;
firebase.initializeApp(firebaseConfig);
database = firebase.database();
storageRef = firebase.storage().ref();
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        // console.log(user);
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

        addManualEventListeners();
    }
    else {
        console.log("user not logged in");
        firebase.auth().signOut().then(() => {
            window.location.assign("/logout");
        });
    }
});

$('#logoutDiv').on('click', function () {
    firebase.auth().signOut().then(() => {
        window.location.assign("/logout");
    });
})

$(function () {

    $('#releasesDiv').on('click', function () { window.location.href = '/releases' });
    $('#supportDiv').on('click', function () { window.location.href = '/support' });
    $('#updateFormDiv').on('click', function () { window.location.href = '/push_update' });

    // accordion toggle collapse
    $('.project-accordion [data-toggle="collapse"]').on('click', function () {
        $(this).find('.toggle-icon').toggleClass('fa-minus-circle fa-plus-circle');
    });

    $('.dropify').dropify();

})

function addManualEventListeners() {
    if (isAdmin) {
        listAllQueries();

        $('#resolveFormSubmitBtn').on('click', function () {
            resolveQuery($(this).data('queryid'));
        });
    } else {
        $('.panel-heading').css('display', 'block');
        listSelfRaisedQueries();
        $('#raiseTicketSubmitBtn').on('click', raiseTicket);
    }
}

function listAllQueries() {
    $('#queryList').empty();
    database.ref('supportQueries').orderByChild('isAnswered').equalTo(false).once('value', snapshot => {
        console.log(snapshot.val());
        let apiData = snapshot.val();
        for (queryObj in apiData) {
            $('#queryList').append(getHTMLStrForQuery(
                apiData[queryObj].subject,
                apiData[queryObj].date[2] + " " + apiData[queryObj].date[1] + ", " + apiData[queryObj].date[3],
                queryObj,
                apiData[queryObj].isAnswered
            ));
        }
    }).then(() => {
        database.ref('supportQueries').orderByChild('isAnswered').equalTo(true).once('value', snapshot => {
            console.log(snapshot.val());
            let apiData = snapshot.val();
            for (queryObj in apiData) {
                $('#queryList').append(getHTMLStrForQuery(
                    apiData[queryObj].subject,
                    apiData[queryObj].date[2] + " " + apiData[queryObj].date[1] + ", " + apiData[queryObj].date[3],
                    queryObj,
                    apiData[queryObj].isAnswered
                ));
            }
        });
    }).then(() => {
        console.log("HUHUHUHUHUHUH")
        $('.solutionModalLink').on('click', function () {
            console.log("+++++++++", "opening solution");
            openSolutionModal($(this).data('query-num'));
        });
        $('.resolveModalLink').on('click', function () {
            console.log("+++++++++", "opening resolve modal");
            openResolveModal($(this).data('query-num'));
        });
    });
}

function listSelfRaisedQueries() {
    $('#queryList').empty();
    database.ref('supportQueries').orderByChild('user_id').equalTo(uid).once('value', snapshot => {
        console.log(snapshot.val());
        let apiData = snapshot.val();
        for (queryObj in apiData) {
            $('#queryList').append(getHTMLStrForQuery(
                apiData[queryObj].subject,
                apiData[queryObj].date[2] + " " + apiData[queryObj].date[1] + ", " + apiData[queryObj].date[3],
                queryObj,
                apiData[queryObj].isAnswered
            ));
        }
    }).then(() => {
        $('.solutionModalLink').on('click', function () {
            openSolutionModal($(this).data('query-num'));
        })
    });
}

function openSolutionModal(queryNum) {
    database.ref('supportQueries/' + queryNum).once('value', snapshot => {
        let apiData = snapshot.val();
        console.log(apiData);
        $('#smQuerySubj').text(apiData.subject);
        $('#smQueryMsg').text(apiData.message);
        $('#smQueryImg').attr('src', apiData.queryImageURL);
        $('#smSolutionMsg').text(apiData.solution.message);
        $('#smSolutionImg').attr('src', apiData.solution.solImageURL);

        $('#modalTicketSolution').modal('show');
    });
}

function openResolveModal(queryNum) {
    database.ref('supportQueries/' + queryNum).once('value', snapshot => {
        let apiData = snapshot.val();
        console.log(apiData);
        $('#rmQuerySubj').text(apiData.subject);
        $('#rmQueryMsg').text(apiData.message);
        $('#rmQueryImg').attr('src', apiData.queryImageURL);
        $('#resolveFormSubmitBtn').attr('data-queryid', queryNum);

        $('#modalGiveSolution').modal('show');
    });
}

function getHTMLStrForQuery(queryTitle, queryDate, queryNum, isAnswered) {
    var htmlStr = '<li>\
        <div class="info">\
            <span class="name">'+ queryTitle + '</span>\
            <span class="email">'+ queryDate + '</span>\
        </div>\
        <div class="controls">';

    if (isAnswered) htmlStr += ('<a class="solutionModalLink" data-query-num="' + queryNum + '"><span class="label label-success label-transparent">ANSWERED</span> Solution</a></div></li>')
    else {
        if (isAdmin) htmlStr += '<a class="resolveModalLink" data-query-num="' + queryNum + '"><span class="label label-warning label-transparent">NOT ANSWERED</span> Resolve</a></div></li>'

        else htmlStr += '<span class="label label-warning label-transparent">NOT ANSWERED</span></div></li>'
    }

    return htmlStr;
}

function resolveQuery(queryId) {
    var solutionData = {
        solution: {
            message: $('#solution-message').val(),
        },
        isAnswered: true
    }

    if (document.querySelector('#soln-file-inp').files.length) {
        var file = document.querySelector('#soln-file-inp').files[0];
        var metadata = {
            'contentType': file.type
        };

        var uploadTask = storageRef.child('supportQueryImages/' + file.name).put(file, metadata);

        uploadTask
            .then(snapshot => snapshot.ref.getDownloadURL())
            .then((url) => {
                solutionData.solution['solImageURL'] = url;
                database.ref('supportQueries/' + queryId).update(solutionData, function (error) {
                    // database.ref('releases/2020_12_15_12_20').update(data, function (error) {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        console.log("Data updated on firebase");
                        $('#modalGiveSolution').modal('hide');
                        $('#resolveForm').trigger('reset');
                        swal({
                            title: "Success!",
                            text: "Query resolved successfully!",
                            type: "success"
                        }, function () {
                            window.location.reload();
                        }).catch(swal.noop);
                    }
                });
            })
            .catch(console.error);
    } else {
        database.ref('supportQueries/' + queryId).update(solutionData, function (error) {
            // database.ref('releases/2020_12_15_12_20').update(data, function (error) {
            if (error) {
                console.log(error);
            }
            else {
                console.log("Data updated on firebase");
                $('#modalGiveSolution').modal('hide');
                $('#resolveForm').trigger('reset');
                swal({
                    title: "Success!",
                    text: "Query resolved successfully!",
                    type: "success"
                }, function () {
                    window.location.reload();
                }).catch(swal.noop);
            }
        });
    }

}

function raiseTicket() {
    var ticketData = {
        user_id: uid,
        subject: $('#ticket-subject').val(),
        message: $('#ticket-message').val(),
        date: new Date().toDateString().split(" "),
        date_val: new Date().valueOf(),
        isAnswered: false
    }

    if (document.querySelector('#file-inp').files.length) {
        var file = document.querySelector('#file-inp').files[0];
        var metadata = {
            'contentType': file.type
        };

        var uploadTask = storageRef.child('supportQueryImages/' + file.name).put(file, metadata);

        uploadTask
            .then(snapshot => snapshot.ref.getDownloadURL())
            .then((url) => {
                ticketData['queryImageURL'] = url;
                database.ref('supportQueries/' + ticketData.date_val).update(ticketData, function (error) {
                    // database.ref('releases/2020_12_15_12_20').update(data, function (error) {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        console.log("Data updated on firebase");
                        $('#modalRaiseTicket').modal('hide');
                        $('#raiseTicketForm').trigger('reset');
                        swal({
                            title: "Success!",
                            text: "Ticket raised successfully!",
                            type: "success"
                        }, function () {
                            window.location.reload();
                        }).catch(swal.noop);
                    }
                });
            })
            .catch(console.error);
    } else {
        database.ref('supportQueries/' + ticketData.date_val).update(ticketData, function (error) {
            // database.ref('releases/2020_12_15_12_20').update(data, function (error) {
            if (error) {
                console.log(error);
            }
            else {
                console.log("Data updated on firebase");
                $('#modalRaiseTicket').modal('hide');
                $('#raiseTicketForm').trigger('reset');
                swal({
                    title: "Success!",
                    text: "Ticket raised successfully!",
                    type: "success"
                }, function () {
                    window.location.reload();
                }).catch(swal.noop);
            }
        });
    }

}
})();