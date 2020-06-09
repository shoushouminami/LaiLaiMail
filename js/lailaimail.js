// local state
let state;
if (window.localStorage) {
    state = JSON.parse(window.localStorage.getItem("state"));
    // failsafe
    if (window.location.search) {
        let params = (new URL(document.location)).searchParams;
        if (params.get("resetState") != null) {
            state = null;
        }
    }
}

if (!state) {
    state = {
        helpMenu: true,
        checkedVersion: "",
        messageTime: "2020年6月9日 星期二 16 : 05",
        messages: []// message: {type: "text|image", value: "text|dataUrl"}
    };
}

let logArea;
function log(o) {
    if (!logArea) {
        logArea = document.getElementById("log-area");
    }

    if (logArea) {
        logArea.appendChild(new Text(o + "\n"));
    }
}

let lineKeyWords = ["one", "two", "three", "four"];

function toLineElement(lineElement, lineKeyWord) {
    lineKeyWords.forEach((w) => {
        if (lineKeyWord !== w) {
            lineElement.classList.remove(w + "-line");
        }
    });
    lineElement.classList.add(lineKeyWord + "-line");

    // activate line background class
    lineElement.querySelectorAll(".line-background").forEach((e) => {
        if (e.classList.contains(lineKeyWord + "-line-background")) {
            e.classList.remove("disabled");
        } else {
            e.classList.add("disabled");
        }
    });

    // change line text class
    lineElement.querySelectorAll(".message-text").forEach((e) => {
        lineKeyWords.forEach((w) => {
            if (lineKeyWord !== w) {
                lineElement.classList.remove(w + "-line-text");
            }
        });
        e.classList.add(lineKeyWord + "-line-text");
    });
}

function adjustLineLength(lineTextElem) {
    for (const bg of lineTextElem.parentElement.querySelectorAll(".width-adjustable")) {
        bg.style.width = Math.max(0, lineTextElem.clientWidth - 8) + "px";
    }

    if (lineTextElem.dataset.previousHeight === undefined
        || lineTextElem.dataset.previousHeight !== lineTextElem.clientHeight) {
        lineTextElem.dataset.previousHeight = lineTextElem.clientHeight;
        if (lineTextElem.clientHeight > lineTextElem.dataset.singleLineHeight) {
            switch (Math.round(lineTextElem.clientHeight / lineTextElem.dataset.singleLineHeight)) {
                case 2:
                    toLineElement(lineTextElem.parentElement, "two");
                    break;
                case 3:
                    toLineElement(lineTextElem.parentElement, "three");
                    break;
                case 4:
                    toLineElement(lineTextElem.parentElement, "four");
            }
        } else {
            toLineElement(lineTextElem.parentElement, "one");
        }
    }
}

function appendOneLine(text) {
    let template = document.createElement("template");
    template.innerHTML = document.getElementById("one-line-template").innerHTML;
    let oneLine = document.getElementById("message-canvas").appendChild(template.content.firstElementChild);
    readOriginalHeight(oneLine);
    if (text) {
        oneLine.querySelectorAll(".message-text").forEach((e) => {
            e.innerText = text;
        })
    }
    oneLine.querySelectorAll(".message-text").forEach((e) => {
        adjustLineLength(e);
    })
}

function appendOneLineFromInput() {
    let input = document.getElementById("text-input");
    if (input && input.innerText.trim().length > 0) {
        appendOneLine(input.innerText);
        input.innerText = "";
    }
    saveMessages();
}

function removeLast() {
    let dom = document.getElementById("message-canvas").lastElementChild;
    if (dom.classList.contains("message")) {
        dom.remove();
    }
}

function readOriginalHeight(elem) {
    if (elem.classList.contains("height-adjustable")) {
        elem.dataset.singleLineHeight = elem.clientHeight;
        // log("name=" + elem.name + " class=" + elem.classList +  " elem.dataset.singleLineHeight=" + elem.dataset.singleLineHeight)
    }

    for (const dom of elem.querySelectorAll(".height-adjustable")) {
        if (!dom.dataset.singleLineHeight) {
            dom.dataset.singleLineHeight = dom.clientHeight;
            // log("name=" + elem.name + " class=" + elem.classList +  " elem.dataset.singleLineHeight=" + elem.dataset.singleLineHeight)
        }
    }
}

function appendImageLine2(path) {
    let template = document.createElement("template");
    template.innerHTML = document.getElementById("image-line-template").innerHTML;
    let oneLine = document.getElementById("message-canvas").appendChild(template.content.firstElementChild);
    oneLine.lastElementChild.setAttribute("src", path);
}

function appendImageFromFile(file) {
    var reader = new FileReader();
    reader.addEventListener("load", function(event2) {
        appendImageLine2(event2.target.result);
        saveMessages();
    });
    reader.readAsDataURL(file);
}

function appendImageLine() {
    let fileSelector = document.createElement("input");
    fileSelector.type = "file";
    fileSelector.accept = "image/png, image/jpeg";
    fileSelector.multiple = false;
    fileSelector.addEventListener("change", function (event) {
        // log("appending file name=" + (fileSelector.files[0]).name);
        appendImageFromFile(fileSelector.files[0]);
        fileSelector.remove();
    });
    // On Mobile Safari, it only works if the element is appending to the document
    fileSelector.style.display = "none";
    document.body.appendChild(fileSelector);
    fileSelector.click();
}

function removeLine(elem) {
    elem.parentElement.remove();
    saveMessages();
}

function dropHandler(event) {
    // console.log(event);
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer.files) {
        // Use DataTransferItemList interface to access the file(s)
        for (let i = 0; i < event.dataTransfer.files.length; i++) {
            appendImageFromFile(event.dataTransfer.files[0]);
        }
    }
}

function saveImage() {
    let saveButton = document.getElementById("save-button");
    saveButton.setAttribute("disabled", "disabled");
    saveButton.firstElementChild.classList.add("disabled");
    saveButton.lastElementChild.classList.remove("disabled");

    let options = {
        // style: {
        //     left: '0',
        //     right: '0',
        //     bottom: '0',
        //     top: '0'
        // }
    };
    domtoimage.toPng(document.querySelector("#capture"), options)
        .then(function (dataUrl) {
            // var img = new Image();
            // img.src = dataUrl;
            // document.getElementById("draw").appendChild(img);
            let link = document.createElement("a");
            link.download = "mail-" + document.getElementById("message-time").innerText + ".png";
            link.href = dataUrl;
            // document.body.appendChild(link);
            link.click();
            // document.body.removeChild(link);
            saveButton.lastElementChild.classList.add("disabled");
            saveButton.firstElementChild.classList.remove("disabled");
            saveButton.removeAttribute("disabled");
        });

    // domtoimage.toJpeg(document.getElementById("capture"), { quality: 0.95 })
    //     .then(function (dataUrl) {
    //         // var img = new Image();
    //         // img.src = dataUrl;
    //         // document.getElementById("draw").appendChild(img);
    //         let link = document.createElement("a");
    //         link.download = "mail-" + document.getElementById("message-time").innerText + ".jpg";
    //         link.href = dataUrl;
    //         // document.body.appendChild(link);
    //         link.click();
    //         // document.body.removeChild(link);
    //         saveButton.lastElementChild.classList.add("disabled");
    //         saveButton.firstElementChild.classList.remove("disabled");
    //         saveButton.removeAttribute("disabled");
    //     });

    // html2canvas(document.getElementById("capture")).then(function(canvas) {
    //     document.body.appendChild(canvas);
    //     saveButton.lastElementChild.classList.add("disabled");
    //     saveButton.firstElementChild.classList.remove("disabled");
    //     saveButton.removeAttribute("disabled");
    // });
}

function draw() {
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext("2d");
    context.moveTo(0, 0);

    // bg
    context.mozImageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.msImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;
    context.drawImage(document.getElementById("background-img"), 0, 0, 400, 900);

    // ctx.moveTo(10, 140);
    context.font = "14px 'Noto Sans SC', sans-serif";
    context.textAlign = "center";
    context.fillStyle = "#b3b3b3";
    context.fillText(document.getElementById("message-time").innerText, 200, 160, 400)

    let y = 200
    let x = 10;
    for (const elem of document.querySelectorAll(".message")) {
        if (elem.classList.contains("image-line")) {
            // state.messages.push({
            //     type: "image",
            //     value: elem.querySelector(".message-image").src
            // });
            // draw image
            let img = elem.querySelector(".message-image");
            let watermark = elem.querySelector(".water-mark");
            if (img) {
                // .image-line padding-top: 8px
                context.drawImage(drawImageWithRoundCorner(img, 25, 1), x, y + 8, img.width, img.height);
                context.drawImage(drawImageWithRoundCorner(watermark, 25, window.getComputedStyle(watermark).getPropertyValue("opacity")), x + img.width - watermark.width - 10, y + 8 + img.height - watermark.height - 10, watermark.width, watermark.height);
            }

            y += elem.clientHeight;
        } else {
            // text message
            let text = elem.querySelector(".message-text").innerText;
            let x = 10;
            y += 7;// x-line-background top: 7px;
            for (const bg of elem.querySelectorAll("img.line-background:not(.disabled)")) {
                context.drawImage(bg, x, y, bg.width, bg.height);
                x += bg.width;
            }

            x = 10;
            context.font = "bold 14px 'Noto Sans SC', sans-serif";
            context.textAlign = "left";
            context.fillStyle = "black";
            // context.fontWeight = "bold";
            // context.fillText(text, x + 18, y + 14, 400);
            let textElem = elem.querySelector(".message-text");
            context.drawImage(drawText(textElem, 20), x + 10, y, textElem.width, textElem.height);
            y += elem.clientHeight - 7;
        }

    }
}

function drawImageWithRoundCorner(img, radius, opacity) {
    let scratchCanvas = document.createElement('canvas');
    scratchCanvas.width = img.width;
    scratchCanvas.height = img.height;

    let scratchCtx = scratchCanvas.getContext('2d');
    scratchCtx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
    scratchCtx.globalCompositeOperation = 'source-over'; //default
    scratchCtx.fillStyle = "rgba(255, 255, 255," + opacity + ")"; //color doesn't matter, but we want full opacity
    scratchCtx.drawImage(img, 0, 0, img.width, img.height);

    scratchCtx.globalCompositeOperation = 'destination-in';
    scratchCtx.beginPath();

    scratchCtx.arc(radius, radius, radius, Math.PI, 1.5 * Math.PI);
    scratchCtx.lineTo(img.width - radius, 0);
    scratchCtx.arc(img.width - radius, radius, radius, 1.5 * Math.PI, 2 * Math.PI);
    scratchCtx.lineTo(img.width, img.height - radius);
    scratchCtx.arc(img.width - radius, img.height - radius, radius, 0, 0.5 * Math.PI);
    scratchCtx.lineTo(radius, img.height);
    scratchCtx.arc(radius, img.height - radius, radius, 0.5 * Math.PI, Math.PI);
    scratchCtx.closePath();
    scratchCtx.fill();
    return scratchCanvas;
}

function drawText(elem, singleLineHeight) {
    let canvas = document.createElement('canvas');
    let lineWidth = elem.clientWidth;
    canvas.width = elem.clientWidth;
    canvas.height = elem.clientHeight;
    let context = canvas.getContext('2d');
    let css = window.getComputedStyle(elem);

    context.globalCompositeOperation = 'source-over';
    context.font = css.fontWeight + " " + css.fontSize + " " + css.fontFamily;
    context.fillStyle = css.color;
    context.textBaseline = "ideographic";
    let y = singleLineHeight;
    for (const text of elem.innerText.split("\n")) {
        if (context.measureText(text).width > lineWidth) {
            let start = 0;
            let sub = "";
            for (let i = 0; i <= text.length; i++) {
                let nextSub = text.substring(start, i);
                if (context.measureText(nextSub).width > lineWidth) {
                    // write sub
                    context.fillText(sub, 0, y);
                    y += singleLineHeight;
                    start = i - 1; // sub has up to [start, i - 1). need to start over from i - 1
                    sub = text.substr(start, i);
                } else {
                    sub = nextSub;
                }
            }
            if (sub.trim().length > 0) {
                context.fillText(sub, 0, y);
                y += singleLineHeight;
            }
        } else {
            context.fillText(text, 0, y);
            y += singleLineHeight;
        }
    }
    document.body.appendChild(canvas);
    return canvas;
}

function enterFullscreen() {
    document.getElementById("capture").addEventListener("click", function (event) {
        document.exitFullscreen();
    })
    document.getElementById("capture").requestFullscreen();
}

function getNameVersion() {
    return "来来喵LaiLaiMail v0.2";
}

document.title = getNameVersion();

function saveLocalState() {
    if (window.localStorage) {
        window.localStorage.setItem("state", JSON.stringify(state));
    }
}

function closeHelp(close) {
    let links = document.querySelectorAll("#close-help-menu a");
    if (close) {
        document.getElementById("help-menu").classList.add("disabled");
        links[0].classList.add("disabled");
        links[1].classList.remove("disabled");
    } else {
        document.getElementById("help-menu").classList.remove("disabled");
        links[0].classList.remove("disabled");
        links[1].classList.add("disabled");
    }

    state.helpMenu = !close;
    state.checkedVersion = getNameVersion();
    saveLocalState();
}

function hideCloseHelp(elem) {
    // closeHelp(true);
    document.getElementById("control").classList.add("disabled")
    document.getElementById("save-button").remove();
    document.querySelector("#save-button img").remove();
}

function loadMessages() {
    document.getElementById("message-time").innerText = state.messageTime;
    if (state.messages && state.messages.length > 0) {
        for (const elem of document.getElementById("message-canvas").querySelectorAll(".message")) {
            elem.remove();
        }

        for (const message of state.messages) {
            if (message.type === "text") {
                appendOneLine(message.value);
            }

            if (message.type === "image") {
                appendImageLine2(message.value);
            }
        }
    }
}

function saveMessages() {
    state.messageTime = document.getElementById("message-time").innerText;
    state.messages = [];
    for (const elem of document.querySelectorAll(".message")) {
        if (elem.classList.contains("message")) {
            if (elem.classList.contains("image-line")) {
                state.messages.push({
                    type: "image",
                    value: elem.querySelector(".message-image").src
                });
            } else {
                // text message
                state.messages.push({
                    type: "text",
                    value: elem.querySelector(".message-text").innerText
                });
            }
        }
    }
    saveLocalState();
}

function preload(imageUrls) {
    return Promise.all(Array.from(imageUrls).map(url => {
        let img = new Image();
        img.url = url;
        return img;
    }).filter(img => !img.complete).map(img => {
        return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
            // img.addEventListener("load", function () {
            //     console.log("loaded " + url)
            //     resolve();
            // });
        });
    }));
}
// init
document.addEventListener("DOMContentLoaded", function (event) {
    document.body.addEventListener("drop", function (event2) {
        dropHandler(event2);
    });
    document.body.addEventListener("dragover", function (event2) {
        event2.preventDefault();
        event2.stopPropagation();
    });

    // apply state
    closeHelp(state.checkedVersion === getNameVersion() && !state.helpMenu);

// wait for all images to load then apply
    preload([
        "image/1line-left-1.png",
        "image/1line-mid-1.png",
        "image/1line-right-1.png",
        "image/2line-1.png",
        "image/3line-1.png",
        "image/4line-1.png",
        "image/logo.png"
    ]).then(function () {
        loadMessages();
        saveMessages();
        draw();
    });
});


