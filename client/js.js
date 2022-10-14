'use strict';
function start() {
    console.log("Start");
}
let neededCategories = [];
async function startTest() {
    let checkBoxes = document.querySelectorAll("input[type=checkbox]");
    checkBoxes.forEach((checkbox) => {
        if (checkbox.checked) {
            neededCategories.push(checkbox.name);
        }
    });
    //console.log(neededCategories);

    /*sitais jaizdzes bus!!!!!!!!*/neededCategories = ["Animals"];

    let response = await fetch('http://localhost:20063/' + "askingForPhotoCategory", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ listofNeededCategories: neededCategories })
    });
    let neededPictureFileNames = await response.json();

    console.log(neededPictureFileNames);
}