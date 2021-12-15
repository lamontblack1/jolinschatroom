// Firebase
var firebaseConfig = {
  apiKey: "AIzaSyAItQs2KtkI5j3pM3FN8yxN_ZnFLyifruI",
  authDomain: "service-storage-acc7a.firebaseapp.com",
  databaseURL: "https://service-storage-acc7a-default-rtdb.firebaseio.com",
  projectId: "service-storage-acc7a",
  storageBucket: "service-storage-acc7a.appspot.com",
  messagingSenderId: "10223659033",
  appId: "1:10223659033:web:6b998588ce24ad03796288"
};
let msgIdCounter = 0;

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Create a reference the database
let db = firebase.database();

// Create a root reference
var storageRef = firebase.storage().ref();

//************************************************************
const messageListRef = db.ref("/Jolin/messages");
const toDoRef = db.ref("/Jolin/toDo");
const patRef = db.ref("/Jolin/pat");
const fsReportRef = db.ref("/Jolin/fsReport");
const imageListRef = db.ref("/Jolin/images");

//set up connection monitor and read connections
let connectionsListRef = db.ref("Jolin/connections");
// '.info/connected' is a special location provided by Firebase that is updated every time
// the client's connection state changes.
// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
let connectedPlayers = db.ref(".info/connected");

//create variables to store user names, choices, user wins and losses
let dingOn = true;
var audioElement = document.createElement("audio");
var typingTimeout;
let aryToDo = [];
let messagesToDelete = [];
let fsReport = {
  carried: 0,
  entries: []
};
let toDoVisible = false;
let patVisible = false;
let fsReportVisible = false;
let justDeleted = false;
$("#toDoWrapper").hide("drop", { direction: "down" }, "slow");

audioElement.setAttribute("src", "./ding1.mp3");
let myScreenName = "";

//BUTTONS*****************************************************************

$("#messageInput").keyup(function () {
  if (myScreenName !== "") {
    db.ref("/Jolin/typing").push({
      personTyping: myScreenName
    });
  }
});

$("#uploadPic").on("click", function () {
  //try to upload a picture
  // const f = new File(
  //   ["C:Users/ct/Desktop/IMG_0146.jpg"],
  //   "C:Users/ct/Desktop/IMG_0146.jpg"
  // );
  const myName = $("#nameInput").val().trim();
  const selectedFile = document.getElementById("input").files[0];

  // Create a reference to 'mountains.jpg'
  // var picRef = storageRef.child(selectedFile.name);

  // Create a reference to 'images/mountains.jpg'
  var picImageRef = storageRef.child("images/" + selectedFile.name);

  picImageRef.put(selectedFile).then((snapshot) => {
    console.log("uploaded!");
    picImageRef
      // .child("images/" + selectedFile.name)
      .getDownloadURL()
      .then((url) => {
        $("#toDoWrapper").css("visibility", "hidden");
        // `url` is the download URL for 'images/stars.jpg'

        // This can be downloaded directly:
        // var xhr = new XMLHttpRequest();
        // xhr.responseType = "blob";
        // xhr.onload = (event) => {
        //   var blob = xhr.response;
        // };
        // xhr.open("GET", url);
        // xhr.send();

        // Or inserted into an <img> element
        //clear the file input
        $("#input").val("");
        //send message with the URL for the picture or file
        messageListRef.push({
          playerName: myName,
          message: "picToPost",
          messageTime: firebase.database.ServerValue.TIMESTAMP,
          URL: url
        });
      });
  });
});

$("#btnDeleteOldPics").on("click", function () {
  storageRef
    .child("images")
    .listAll()
    .then(function (res) {
      res.items.forEach(function (itemRef) {
        itemRef.delete();
        // itemRef.getDownloadURL().then(function (link) {
        //   console.log(link);
        // })
      });
    });
});

$("#btnDing").on("click", function () {
  if (dingOn) {
    dingOn = false;
    $("#btnDing").text("Turn The Ding Back On");
  } else if (!dingOn) {
    dingOn = true;
    $("#btnDing").text("Turn The Ding Off");
  }
});

$("#btnToDo").on("click", function () {
  if (toDoVisible) {
    $("#toDoWrapper").hide("drop", { direction: "down" }, "slow");
    // $("#toDoWrapper").css("visibility", "hidden");
    toDoVisible = !toDoVisible;
  } else {
    $("#toDoWrapper").css("visibility", "visible");
    $("#toDoWrapper").show("drop", { direction: "up" });
    toDoVisible = !toDoVisible;
  }
});

$("#btnPat").on("click", function () {
  if (patVisible) {
    // $("#patWrapper").hide("drop", { direction: "down" }, "slow");
    $("#patWrapper").css("visibility", "hidden");
  } else {
    $("#patWrapper").css("visibility", "visible"); //to use the animation this must be done first
    // $("#patWrapper").show("drop", { direction: "down" });
  }
  patVisible = !patVisible;
});

$("body").on("click", "button.btnDelete", function () {
  const msgKey = $(this).attr("data");
  messagesToDelete.push(msgKey);
  $("#" + msgKey).remove();
});

$("#btnFsReport").on("click", function () {
  if (fsReportVisible) {
    $("#fsReportWrapper").css("visibility", "hidden");
  } else {
    $("#fsReportWrapper").css("visibility", "visible");
  }
  fsReportVisible = !fsReportVisible;
});

$("#btnSend").on("click", function () {
  if ($("#messageInput").val() !== "" && $("#nameInput").val() !== "") {
    let messageToSend = $("#messageInput").val();
    messageToSend = urlify(messageToSend);
    myScreenName = $("#nameInput").val().toLowerCase();
    let myName = $("#nameInput").val().toLowerCase();
    pushMessage($("#nameInput").val().trim(), messageToSend);
    $("#messageInput").val("");
  } else {
    alert("Name or Message is empty!");
  }
});

$("#btnSendText").on("click", function () {
  if ($("#passwordInput").val() !== "" && $("#messageInput").val() !== "") {
    let messageToSend = $("#messageInput").val();
    let pwd = $("#passwordInput").val();
    //send email ergo text messages
    Email.send({
      Host: "smtp.gmail.com",
      Username: "longqicoding",
      Password: pwd,
      To: "9415868180@messaging.sprintpcs.com",
      From: "jolin@home.com",
      Subject: "From Jolin, msg: " + messageToSend,
      Body: messageToSend
    }).then(function (message) {
      console.log(message);
      if (message.trim() === "OK") {
        pushMessage(
          $("#nameInput").val().trim(),
          "The text worked and was sent. You sent: " + messageToSend
        );
      } else {
        pushMessage(
          $("#nameInput").val().trim(),
          "The text DID NOT WORK! Check the password and make sure nothing is blank and try again"
        );
      }
    });

    Email.send({
      Host: "smtp.gmail.com",
      Username: "longqicoding",
      Password: pwd,
      To: "9415868224@messaging.sprintpcs.com",
      From: "Jolin@home.com",
      Subject: "From Jolin, msg: " + messageToSend,
      Body: messageToSend
    }).then(function (message) {
      console.log(message);
    });

    $("#messageInput").val("");
  } else {
    alert(
      "You have to type the password and your name to send a text message!"
    );
  }
});

$("#btnAddToDo").on("click", function () {
  let item = $("#toDoInput").val();
  item = urlify(item);
  toDoRef.push({
    toDo: item
  });
  $("#toDoInput").val("");
});

$(document).on("click", ".to-do-item", function (event) {
  if ($("#passwordInput").val() !== "password") {
    let aryIndex = parseInt(this.id);
    let newAryToDo = aryToDo;
    // alert(this.id)
    newAryToDo.splice(aryIndex, 1); //problem is here
    toDoRef.remove();
    console.log(newAryToDo);
    for (let i = 0; i < newAryToDo.length; i++) {
      const element = newAryToDo[i];
      toDoRef.push({
        toDo: element
      });
    }
  }
});

let pat;
$("#submitPat").on("click", function (event) {
  event.preventDefault();
  pat.chapters = $("#chapters").val();
  pat.dates = $("#patDates").val();
  for (let i = 0; i < 9; i++) {
    pat.questions[i].question = $("#question" + i).val();
    pat.questions[i].answer = $("#answer" + i).val();
  }
  // console.log(pat);
  patRef.set(pat);

  // var patURL = "https://jolin-pat-api.herokuapp.com/api/pat";
  // $.ajax({
  //   url: patURL,
  //   cache: false,
  //   method: "POST",
  //   crossDomain: true,
  //   data: pat,
  //   headers: {
  //     "Access-Control-Allow-Origin":
  //       "https://lamontblack1.github.io/jolinschatroom"
  //   },
  //   success: function (response) {
  //     if (response === true) {
  //       alert("Your answers have been saved!");
  //     }
  //   }
  // });

  //replaced with firebase, but was working as is
  // $.post(patURL, pat).then(function (data) {
  //   if (data === true) {
  //     alert("Your answers have been saved!");
  //   }
  // });
});

$("#saveFsReport").on("click", function (event) {
  event.preventDefault();
  fsReport.entries = [];
  fsReport.carried = $("#carried").val();
  for (let i = 0; i < 5; i++) {
    const value1 = $("#date" + i).val();
    const value2 = $("#hours" + i).val();
    const value3 = $("#plc" + i).val();
    const value4 = $("#rv" + i).val();

    let entryObject = {
      date: value1,
      hours: value2,
      plc: value3,
      rv: value4
    };
    fsReport.entries.push(entryObject);
  }
  fsReportRef.set(fsReport);
});

//EVENTS*********************************************************************************

//allow file input to have a file pasted into it
window.addEventListener("paste", (e) => {
  const fileInput = document.getElementById("input");
  fileInput.files = e.clipboardData.files;
});

db.ref("/Jolin/typing").on("child_added", function (snap) {
  if (snap.val()) {
    if (snap.val().personTyping !== myScreenName) {
      makeTypingGifVisible();
    }
  }
});

//permanently delete any message keys that are in the messagesToDelete array
window.onbeforeunload = function (event) {
  db.ref("/Jolin/typing").remove();
  deleteDeletedMessages();
};

// When the client's connection state changes keep track of connections
connectedPlayers.on("value", function (snap) {
  // If they are connected..
  if (snap.val()) {
    // Add user to the connections list.
    var con = connectionsListRef.push(true);
    // Remove user from the connection list when they disconnect.
    con.onDisconnect().remove();
    //add a notification that the player disconnected
  }
});

connectionsListRef.on("value", function (snap) {
  //update the number of connections
  //   intConnections = snap.numChildren()
  //   console.log("connections: " + intConnections)
  //If this instance is first connection, it is player1, if second connection, player2. otherwise too many people
});

toDoRef.on("value", function (snap) {
  aryToDo = [];
  for (const property in snap.val()) {
    aryToDo.push(snap.val()[property].toDo);
  }
  $("#toDoList").empty();
  for (let i = 0; i < aryToDo.length; i++) {
    const element = aryToDo[i];
    $("#toDoList").prepend(
      "<button class='btn btn-outline-secondary to-do-item' id='" +
        i +
        "'>x</button><span>" +
        element +
        "</span><br>"
    );
  }
});

messageListRef.limitToLast(10).on(
  "child_added",
  function (snapshot) {
    msgIdCounter = msgIdCounter + 1;
    let dateVal = snapshot.val().messageTime;
    // let msgTimeStamp = moment(dateVal).fromNow(false)
    let msgTimeStamp = moment(dateVal).format("dddd hh:mma");
    // console.log(msgTimeStamp);
    let msgPlayerName = snapshot.val().playerName;
    msgPlayerName = msgPlayerName.toLowerCase().trim();
    let msgMessage = snapshot.val().message;
    //this can help add a picture
    let imgLine =
      "<img src='./images/" +
      msgPlayerName +
      ".jpg' class='userPic' alt='...'></img>";

    // if file or picture
    if (snapshot.val().URL) {
      //This is where you prepend the card with the picture from the URL
      $("#messagesBox").prepend(
        "<div class='row mb-1'><div class='col-2'></div><div class='col-10'>" +
          "<div class='card' id='" +
          snapshot.key +
          "' style='background-color: #DABFFF;'><div class='card-header p-1 pl-2'>" +
          imgLine +
          msgPlayerName +
          "  <small class='text-muted'>" +
          msgTimeStamp +
          "</small><button class='btnDelete btn btn-outline-secondary font-weight-bold mb-1' type='button' data='" +
          snapshot.key +
          "'>x</button></div>" +
          "<div class='card-body py-1 pl-2'>" +
          "<img src='" +
          snapshot.val().URL +
          "' class='img-fluid' width='90%'>" +
          //  "<p class='card-title'>" +
          //     msgMessage +
          //     "</p>" +
          "</div></div>" +
          "</div>" +
          "</div>"
      );

      //put my own texts to the right
    } else {
      //handle first messages when page loads
      if (msgPlayerName === $("#nameInput").val().toLowerCase()) {
        $("#messagesBox").prepend(
          "<div class='row mb-1'><div class='col-2'></div><div class='col-10'>" +
            "<div class='card' id='" +
            snapshot.key +
            "' style='background-color: #DABFFF;'><div class='card-header p-1 pl-2'>" +
            imgLine +
            msgPlayerName +
            "  <small class='text-muted'>" +
            msgTimeStamp +
            "</small><button class='btnDelete btn btn-outline-secondary font-weight-bold mb-1' type='button' data='" +
            snapshot.key +
            "'>x</button></div>" +
            "<div class='card-body py-1 pl-2'><p class='card-title'>" +
            msgMessage +
            "</p>" +
            "</div></div>" +
            "</div>" +
            "</div>"
        );
      } else if ($("#nameInput").val() == "") {
        $("#messagesBox").prepend(
          "<div class='row mb-1'><div class='col-1'></div><div class='col-10'>" +
            "<div class='card' id='" +
            snapshot.key +
            "' style='background-color: #C49BBB;'><div class='card-header p-1 pl-2'>" +
            imgLine +
            msgPlayerName +
            "  <small class='text-muted'>" +
            msgTimeStamp +
            "</small><button class='btnDelete btn btn-outline-secondary font-weight-bold mb-1' type='button' data='" +
            snapshot.key +
            "'>x</button></div>" +
            "<div class='card-body py-1 pl-2'><p class='card-title'>" +
            msgMessage +
            "</p>" +
            "</div></div>" +
            "</div>" +
            "</div>"
        );

        // put messages from others on the left
      } else {
        if (dingOn) {
          audioElement.play();
        }
        //Put messages from others on the left
        $("#messagesBox").prepend(
          "<div class='row mb-1'><div class='col-10' style='float: left;'>" +
            "<div class='card' id='" +
            snapshot.key +
            "' style='background-color: #7FEFBD;'><div class='card-header p-1 pl-2 font-italic'>" +
            imgLine +
            msgPlayerName +
            "  <small class='text-muted'>" +
            msgTimeStamp +
            "</small><button class='btnDelete btn btn-outline-secondary font-weight-bold mb-1' type='button' data='" +
            snapshot.key +
            "'>x</button></div>" +
            "<div class='card-body py-1 pl-2'><p class='card-title'>" +
            msgMessage +
            "</p>" +
            "</div></div>" +
            "</div>" +
            "</div>"
        );
      }
      $("#message" + msgIdCounter).effect("shake");
    }
    // Handle the errors
  },
  function (errorObject) {
    console.log("Errors handled: " + errorObject.code);
  }
);

patRef.on("value", (snapshot) => {
  pat = snapshot.val();

  $("#chapters").val(pat.chapters);
  $("#patDates").val(pat.dates);
  $("#questionsWrapper").empty();

  for (let index = 0; index < 9; index++) {
    $("#questionsWrapper").append(
      "<div class='form-group'>" +
        // "<label for='question" +
        // index +
        // "'>Question</label>" +
        "<textarea class='form-control patQuestion' id='question" +
        index +
        "' rows='2'>" +
        pat.questions[index].question +
        "</textarea></div>" +
        "<div class='form-group'>" +
        // "<label for='answer" +
        // index +
        // "'>Answer</label>" +
        "<textarea class='form-control' id='answer" +
        index +
        "' rows='2'>" +
        pat.questions[index].answer +
        "</textarea></div>"
    );
  }
});

fsReportRef.on("value", (snapshot) => {
  fsReport = snapshot.val();
  $("#carried").val(fsReport.carried);

  for (let i = 0; i < 5; i++) {
    $("#date" + i).val(fsReport.entries[i].date);
    $("#hours" + i).val(fsReport.entries[i].hours);
    $("#plc" + i).val(fsReport.entries[i].plc);
    $("#rv" + i).val(fsReport.entries[i].rv);
  }
  $("#hoursTotal").text(
    parseFloat(fsReport.carried) +
      parseFloat(fsReport.entries[0].hours) +
      parseFloat(fsReport.entries[1].hours) +
      parseFloat(fsReport.entries[2].hours) +
      parseFloat(fsReport.entries[3].hours) +
      parseFloat(fsReport.entries[4].hours)
  );
  $("#plcTotal").text(
    parseFloat(fsReport.entries[0].plc) +
      parseFloat(fsReport.entries[1].plc) +
      parseFloat(fsReport.entries[2].plc) +
      parseFloat(fsReport.entries[3].plc) +
      parseFloat(fsReport.entries[4].plc)
  );
  $("#rvTotal").text(
    parseFloat(fsReport.entries[0].rv) +
      parseFloat(fsReport.entries[1].rv) +
      parseFloat(fsReport.entries[2].rv) +
      parseFloat(fsReport.entries[3].rv) +
      parseFloat(fsReport.entries[4].rv)
  );
});

//FUNCTIONS **********************************************************

function makeTypingGifVisible() {
  $("#typingGif").css("visibility", "visible");
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(function () {
    $("#typingGif").css("visibility", "hidden");
  }, 1000);
}

function pushMessage(player, messageToPost) {
  messageListRef.push({
    playerName: player,
    message: messageToPost,
    messageTime: firebase.database.ServerValue.TIMESTAMP
  });
}

function urlify(text) {
  let urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function (url) {
    return '<a href="' + url + '" target="_blank">' + "Here is the link</a>";
  });
  // or alternatively
  // return text.replace(urlRegex, '<a href="$1">$1</a>')
}

function deleteDeletedMessages() {
  for (let i = 0; i < messagesToDelete.length; i++) {
    const msgKey = messagesToDelete[i];
    db.ref("/Jolin/messages/" + msgKey).remove();
  }
}

function get_browser() {
  var ua = navigator.userAgent,
    tem,
    M =
      ua.match(
        /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
      ) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return { name: "IE", version: tem[1] || "" };
  }
  if (M[1] === "Chrome") {
    tem = ua.match(/\bOPR|Edge\/(\d+)/);
    if (tem != null) {
      return { name: "Opera", version: tem[1] };
    }
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, "-?"];
  if ((tem = ua.match(/version\/(\d+)/i)) != null) {
    M.splice(1, 1, tem[1]);
  }
  return {
    name: M[0],
    version: M[1]
  };
}

var browser = get_browser(); // browser.name = 'Chrome'
// browser.version = '40'
alert(browser.name);
if (browser.name === "safari") {
  $("#btnDeleteDeleted").attr("visibility", "visible");
}
