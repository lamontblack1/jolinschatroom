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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Create a variable to reference the database
let db = firebase.database();
//add a notification that the player connected

//connections to store player info and messages and notifications
// let playerInfoRef = db.ref("/players")
let messageListRef = db.ref("/Jolin/messages");
let toDoRef = db.ref("/Jolin/toDo");

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

// Set it's source to the location
audioElement.setAttribute("src", "./ding1.mp3");
let myScreenName = "";

// tinymce.init({
//   selector: "#messageInput",
//   plugins: "emoticons",
//   toolbar: "emoticons",
//   toolbar_location: "top",
//   menubar: true
// });

$("#messageInput").keyup(function () {
  if (myScreenName !== "") {
    db.ref("/Jolin/typing").push({
      personTyping: myScreenName
    });
  }
});

db.ref("/Jolin/typing").on("child_added", function (snap) {
  if (snap.val()) {
    if (snap.val().personTyping !== myScreenName) {
      makeTypingGifVisible();
    }
  }
});

function makeTypingGifVisible() {
  $("#typingGif").css("visibility", "visible");
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(function () {
    $("#typingGif").css("visibility", "hidden");
  }, 1000);
}

window.onbeforeunload = function (event) {
  db.ref("/Jolin/typing").remove();
};

$("#btnDing").on("click", function () {
  if (dingOn) {
    dingOn = false;
    $("#btnDing").text("Turn The Ding Back On");
  } else if (!dingOn) {
    dingOn = true;
    $("#btnDing").text("Turn The Ding Off");
  }
});

let toDoVisible = false;
$("#btnToDo").on("click", function () {
  if (toDoVisible) {
    $("#toDoWrapper").css("visibility", "hidden");
    toDoVisible = !toDoVisible;
  } else {
    $("#toDoWrapper").css("visibility", "visible");
    toDoVisible = !toDoVisible;
  }
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
    alert("Type your name in the top box to be able to send a message!");
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
      From: "longqicoding@gmail.com",
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
          "The text DID NOT WORK! Check the password and try again"
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
    }).then();

    $("#messageInput").val("");
  } else {
    alert(
      "You have to type the password and your name to send a text message!"
    );
  }
});

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
      "<button class='to-do-item' id='" +
        i +
        "'>x</button><span>" +
        element +
        "</span><br>"
    );
  }
});

$("#btnAddToDo").on("click", function () {
  let item = $("#toDoInput").val();
  toDoRef.push({
    toDo: item
  });
  $("#toDoInput").val("");
});

$(document).on("click", ".to-do-item", function (event) {
  if ($("#passwordInput").val() === "password") {
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

function pushMessage(player, messageToPost) {
  messageListRef.push({
    playerName: player,
    message: messageToPost,
    messageTime: firebase.database.ServerValue.TIMESTAMP
  });
}

messageListRef.limitToLast(20000).on(
  "child_added",
  function (snapshot) {
    // console.log(snapshot.val());
    // console.log(snapshot.val().playerName);
    // console.log(snapshot.val().message);
    let dateVal = snapshot.val().messageTime;
    // let msgTimeStamp = moment(dateVal).fromNow(false)
    let msgTimeStamp = moment(dateVal).format("dddd hh:mma");
    // console.log(msgTimeStamp);
    let msgPlayerName = snapshot.val().playerName;
    msgPlayerName = msgPlayerName.toLowerCase().trim();
    let msgMessage = snapshot.val().message;
    //this can help add a picture
    let imgLine =
      "<img src='./images/" + msgPlayerName + ".jpg' alt='...'></img>";

    document.write(
      msgPlayerName +
        ", " +
        moment(dateVal).format("M/D/y") +
        ": " +
        msgMessage +
        "<br>"
    );

    // if (msgPlayerName === $("#nameInput").val().toLowerCase()) {
    //   $("#messagesBox").prepend(
    //     "<div class='row mb-1'><div class='col-2'></div><div class='col-10'>" +
    //       "<div class='card' style='background-color: #DABFFF;'><div class='card-header p-1 pl-2'>" +
    //       imgLine +
    //       msgPlayerName +
    //       "  <small class='text-muted'>" +
    //       msgTimeStamp +
    //       "</small></div>" +
    //       "<div class='card-body py-1 pl-2'><p class='card-title'>" +
    //       msgMessage +
    //       "</p>" +
    //       "</div></div>" +
    //       "</div>" +
    //       "</div>"
    //   );
    // } else if ($("#nameInput").val() == "") {
    //   $("#messagesBox").prepend(
    //     "<div class='row mb-1'><div class='col-1'></div><div class='col-10'>" +
    //       "<div class='card' style='background-color: #C49BBB;'><div class='card-header p-1 pl-2'>" +
    //       imgLine +
    //       msgPlayerName +
    //       "  <small class='text-muted'>" +
    //       msgTimeStamp +
    //       "</small></div>" +
    //       "<div class='card-body py-1 pl-2'><p class='card-title'>" +
    //       msgMessage +
    //       "</p>" +
    //       "</div></div>" +
    //       "</div>" +
    //       "</div>"
    //   );
    // } else {
    //   if (dingOn) {
    //     audioElement.play();
    //   }

    //   $("#messagesBox").prepend(
    //     "<div class='row mb-1'><div class='col-10' style='float: left;'>" +
    //       "<div class='card' style='background-color: #7FEFBD;'><div class='card-header p-1 pl-2 font-italic'>" +
    //       imgLine +
    //       msgPlayerName +
    //       "  <small class='text-muted'>" +
    //       msgTimeStamp +
    //       "</small></div>" +
    //       "<div class='card-body py-1 pl-2'><p class='card-title'>" +
    //       msgMessage +
    //       "</p>" +
    //       "</div></div>" +
    //       "</div>" +
    //       "</div>"
    //   );
    // }

    // Handle the errors
  },
  function (errorObject) {
    console.log("Errors handled: " + errorObject.code);
  }
);

function urlify(text) {
  let urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function (url) {
    return '<a href="' + url + '" target="_blank">' + url + "</a>";
  });
  // or alternatively
  // return text.replace(urlRegex, '<a href="$1">$1</a>')
}
