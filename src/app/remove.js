// <reference path="jquery-1.11.1.min.js" />
// <reference path="jquery-1.11.1.ui.min.js" />

var result;
var sender_list;
var sending_from;
var visitID;
var tokenID;
var clientID;

$.ajax({
    url: '../Common/Request.aspx?SocketURl=True',
    type: "POST",
    dataType: 'json',
    async: false,
    success: function (data) {
        result = data;
    }
});
var sock = new WebSocket(result.Data.SockURL);
var videoURL = result.Data.VideoURL;
var userID = result.Data.UserId.toLowerCase();


userRegistration();

function userRegistration() {
    //alert('hi');
    setTimeout(function () {
        //sock.readyState = 1;
        if (!sock || sock.readyState === WebSocket.CLOSED) resetSocket(); 
        sock.send(JSON.stringify({
            type: 'userID',
            value: userID //$('#hfUserId').val()
        }));
        userRegistration();
    }, 60000);
}

function resetSocket() {
    sock = new WebSocket(result.Data.SockURL);
    sock.send(JSON.stringify({
        type: 'userID',
        value: userID 
    }));
}

sock.onopen = function () {
    //alert(result.Data.UserId + ',' + $('#hfUserId').val());
    sock.send(JSON.stringify({
        type: 'userID',
        value: userID //$('#hfUserId').val()
    }))
}

sock.onclose = function () {
    console.log('closed!');
    //if (!sock || sock.readyState === WebSocket.CLOSED) resetSocket();     
};


sock.onmessage = function (event) {
    console.log("Socket ", event);
    var data = JSON.parse(event.data);
    if (data.type === 'rejectCall') {
        $("#WebRTC-calling").modal('hide');
        myAlert(data.message.message, 'Warning!');
    }
    else if (data.type === 'callAccepted') {
        $("#WebRTC-calling").modal('hide');
        if (data.message.device_type == 'iOS') {
            AcceptVidyoCallService(visitID);
        }
        else { window.open(videoURL + 'token=' + tokenID + '&visit_id=' + visitID + '&user_id=' + userID + '', '_blank'); }

    }
    else if (data.type === 'unanswered') {
        $("#WebRTC-calling").modal('hide');
        myAlert(data.message.message, 'Warning!');
    }
    else {
        play_audio('play');

        $("#WebRTC-modal").modal('show');
        $("#WebRTC-alerttext").html(data.message.message);
        tokenID = data.message.token;
        clientID = data.message.client_id;
        visitID = data.message.visit_id;
        sender_list = data.message.send_list;
        sending_from = data.message.sending_from;

        setTimeout(function () {
            $.ajax({
                type: "GET",
                url: "../Common/Request.aspx?RejectCallService=True&VisitID=" + data.message.visit_id,
                data: '{}',
                cache: false,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    if (response.Status == 1) {
                        if (response.Data.status == "success") {
                            //alert(response.Data.message);

                            sender_list = response.Data.sendlist;
                            sending_from = response.Data.sendfrom;

                            //$('#send_list').val(response.Data.sendlist);
                            //$('#sending_from').val(response.Data.sendfrom);

                            $("#WebRTC-modal").modal('hide');
                            $("#WebRTC-alerttext").val('');
                            if (!sock || sock.readyState === WebSocket.CLOSED) resetSocket();
                            sock.send(JSON.stringify({
                                type: 'unanswered',
                                send_list: [sender_list],
                                sending_from: sending_from
                            }))
                            play_audio('stop');
                            sock.send(JSON.stringify({
                                type: 'userID',
                                value: userID //$('#hfUserId').val()
                            }))
                        }
                    }
                    else if (response.Status == 2) {
                        myAlert(response.ErrorMessage, 'Warning!');
                    }
                    else {
                        window.location = response.ErrorMessage;
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    myAlert(response.ErrorMessage, 'Warning!');
                }
            });
        }, 60000);
        //$('#hftoken').val(data.message.token);
        //$('#hfclientID').val(data.message.client_id);
        //$('#hfVisitId').val(data.message.visit_id);
        //$('#send_list').val(data.message.send_list);
        //$('#sending_from').val(data.message.sending_from);
    }
}

function AcceptCall() {
    $("#WebRTC-modal").modal('hide');
    $("#WebRTC-alerttext").val('');
    play_audio('stop');

    var VisitID = visitID;//$('#hfVisitId').val();
    $.ajax({
        type: "GET",
        url: "../Common/Request.aspx?RejectCallService=True&VisitID=" + VisitID,
        data: '{}',
        cache: false,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            if (response.Status == 1) {
                if (response.Data.status == "success") {
                    //alert(response.Data.message);
                    sender_list = response.Data.sendlist;
                    sending_from = response.Data.sendfrom;

                    //$('#send_list').val(response.Data.sendlist);
                    //$('#sending_from').val(response.Data.sendfrom);

                    $("#WebRTC-modal").modal('hide');
                    $("#WebRTC-alerttext").val('');
                    if (!sock || sock.readyState === WebSocket.CLOSED) resetSocket();
                    sock.send(JSON.stringify({
                        type: 'callAccepted',
                        send_list: [sender_list],
                        sending_from: sending_from
                    }))
                }
            }
            else if (response.Status == 2) {
                myAlert(response.ErrorMessage, 'Warning!');
            }
            else {
                window.location = response.ErrorMessage;
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            myAlert(response.ErrorMessage, 'Warning!');
        }
    });

    window.open(videoURL + 'token=' + tokenID + '&visit_id=' + visitID + '&user_id=' + userID + '', '_blank');
    sock.send(JSON.stringify({
        type: 'userID',
        value: userID //$('#hfUserId').val()
    }))
}


//window close and popup reject call this method
function RejectCall(VisitID) {
    VisitID = visitID;// $('#hfVisitId').val();
    $.ajax({
        type: "GET",
        url: "../Common/Request.aspx?RejectCallService=True&VisitID=" + VisitID,
        data: '{}',
        cache: false,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            if (response.Status == 1) {
                if (response.Data.status == "success") {
                    //alert(response.Data.message);

                    sender_list = response.Data.sendlist;
                    sending_from = response.Data.sendfrom;

                    //$('#send_list').val(response.Data.sendlist);
                    //$('#sending_from').val(response.Data.sendfrom);

                    $("#WebRTC-modal").modal('hide');
                    $("#WebRTC-alerttext").val('');
                    if (!sock || sock.readyState === WebSocket.CLOSED) resetSocket();
                    sock.send(JSON.stringify({
                        type: 'rejectCall',
                        send_list: [sender_list],
                        sending_from: sending_from
                    }))
                    play_audio('stop');
                    sock.send(JSON.stringify({
                        type: 'userID',
                        value: userID //$('#hfUserId').val()
                    }))
                }
            }
            else if (response.Status == 2) {
                myAlert(response.ErrorMessage, 'Warning!');
            }
            else {
                window.location = response.ErrorMessage;
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            myAlert(response.ErrorMessage, 'Warning!');
        }
    });
    return false;

}
