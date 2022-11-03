'use strict';
function start() {
    console.log("Start");
}

let leadPath = "/ppp/photos/";
let neededCategories = [];
let neededPictureFileNames;
let imageIds = ["leftTopImg", "rightTopImg", "leftBotImg", "rightBotImg"];
let textDiv;
let curentCorrectImgID;
let failSound;

let currentWord = '';

async function startTest() {
    failSound = new Audio("./sounds/fail.mp3");
    textDiv = document.getElementById("nameDiv");
    let checkBoxes = document.querySelectorAll("input[type=checkbox]");

    checkBoxes.forEach((checkbox) => {
        if (checkbox.checked) {
            neededCategories.push(checkbox.name);
        }
    });
    if (neededCategories.length == 0) {
        alert("Please select a category");
        return;
    }
    //console.log(neededCategories);

    ///*sitais jaizdzes bus!!!!!!!!*/neededCategories = ["Animals"];

    let response = await fetch('http://localhost:20063/' + "askingForPhotoCategory", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ listofNeededCategories: neededCategories })
    });
    neededPictureFileNames = await response.json();

    console.log(neededPictureFileNames);

    //preperation for image test;

    document.getElementById("imgContainer").style.display = "block";
    document.getElementById("startContainer").style.display = "none";
    curentCorrectImgID = imageIds[Math.floor(Math.random() * neededPictureFileNames.length)];

    for (let i = 0; i < 4; i++) {
        document.getElementById(imageIds[i]).addEventListener("click", async (event) => {
            await imageIsClicked(event, imageIds[i]);
        });
    }

    await replaceImagesRandomly();
}

function textToSpeech(text) {
    new Promise(
        function (resolve, reject) {
            let synth = window.speechSynthesis;

            setTimeout(() => {
                if (synth.getVoices().length !== 0) {
                    resolve(synth.getVoices());
                }
            }, 100);
        }
    )
        .then((voices) => {
            var msg = new SpeechSynthesisUtterance();
            msg.voice = voices.find(v => v.lang == 'de-DE');
            msg.voiceURI = 'native';
            msg.volume = 1; // 0 to 1
            msg.rate = 0.8; // 0.1 to 10
            msg.pitch = 1; //0 to 2
            msg.text = text;
            msg.lang = 'de-DE';

            msg.onend = function (e) {
                console.log('Finished in ' + e.elapsedTime + ' seconds.');
            };

            msg.onerror = function (e) {
                console.log(['error ', e]);
            };

            console.log(msg);

            speechSynthesis.speak(msg);

        });

}


async function imageIsClicked(event, imageID) {
    if (curentCorrectImgID == imageID) {
        await replaceImagesRandomly(imageID);
    } else {
        failSound.play();
    }
}

function repeatText() {
    textToSpeech(currentWord);
}

async function replaceImagesRandomly(clickedImageID) {

    let selectedFourImages = [];
    for (let i = 0; i < 4; i++) {
        selectedFourImages.push(neededPictureFileNames[Math.floor(Math.random() * neededPictureFileNames.length)]);
    }

    curentCorrectImgID = imageIds[Math.floor(Math.random() * selectedFourImages.length)];
    for (let i = 0; i < 4; i++) {
        let randomPic = selectedFourImages[Math.floor(Math.random() * selectedFourImages.length)];


        let tempImg = new Image();

        tempImg.onload = () => {
            let currentIMG = document.getElementById(imageIds[i]);
            let divHeight = currentIMG.parentNode.clientHeight;
            let divWidth = currentIMG.parentNode.clientWidth;
            let hdiff = tempImg.width / divWidth;
            let vdiff = tempImg.height / divHeight;
            let largestProportion = Math.max(hdiff, vdiff);
            currentIMG.width = tempImg.width / largestProportion;
            currentIMG.height = tempImg.height / largestProportion;
            currentIMG.src = tempImg.src;
            currentIMG.style.position = 'absolute';
            currentIMG.style.top = `${(currentIMG.parentNode.clientHeight - currentIMG.height) / 2}px`;
            currentIMG.style.left = `${(currentIMG.parentNode.clientWidth - currentIMG.width) / 2}px`;
        }
        tempImg.src = encodeURI(leadPath + randomPic.category + "/" + randomPic.name);


        if (imageIds[i] == curentCorrectImgID) {
            currentWord = randomPic.name.substring(0, randomPic.name.lastIndexOf("."));
            textDiv.innerHTML = currentWord;
            textToSpeech(currentWord);
        }
    }
}
