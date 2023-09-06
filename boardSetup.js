let startTime;
let stopTimeId;
let scrunch = !rand;

const colors = [
  "rgb(255,0,0)",
  "rgb(255,255,0)",
  "rgb(0,0,255)",
  "rgb(0,128,0)",
  "rgb(255,0,255)",
  "rgb(0,255,0)",
  "rgb(0,255,255)",
  "rgb(0,0,0)",
  "rgb(255,255,255)",
]

const device = window.getUserDevice();

const outerMargin = device=="DESKTOP" ? 100 : 30;   // px
const innerMarginUnits = 5/6;   // wrt cardH
const innerBtwnUnits = 1/6;     // wrt cardH
const cornerRatio = 0.07;       // wrt cardH
const dotScale = 1.35;          // wrt dividing card evenly (btwn==dot)
const fixedCardW = 10;          // vw
const borderW = 1.666;          // % of cardH
const selectW = 2.85;           // % of cardH

const getDimensions = vw => {
  const numCardCols = [[3,3],[3,3],[3,4],[3,4],[3,5],[4,5]][n-4][scrunch?0:1];
  const numDotCols = n>6 ? 3 : 2;
  const numCardRows = (scrunch && n > 5) ? 3 : 2;
  const numDotRows = n>4 ? 3 : 2;
  const cardH = fixedCardW/100*vw;
  // const baseUnit = cardH/cardUnits;
  const innerMargin = cardH*innerMarginUnits;
  const innerBtwn = cardH*innerBtwnUnits;
  const cardRad = cardH*cornerRatio;
  const boxH = 2*innerMargin+(numCardRows-1)*innerBtwn+numCardRows*cardH;
  const dotW = cardH*dotScale/(numDotRows*2+1);
  const dotBtwn = (cardH-dotW*numDotRows)/(numDotRows+1);
  const cardW = dotW*numDotCols+dotBtwn*(numDotCols+1);
  const boxW = cardW*numCardCols+(numCardCols-1)*innerBtwn+2*innerMargin;

  return {
    numCardCols,numCardRows,numDotCols,numDotRows,
    dims: {
      boxW, boxH, innerMargin, innerBtwn, cardW, cardH, cardRad, dotW, dotBtwn,
      extraPadding: (cardH+innerBtwn)/2,
      borderW: borderW*cardH/100,
      selectW: selectW*cardH/100,
    }
  }
}

const {numCardCols,numCardRows,numDotCols,numDotRows,dims} = getDimensions(window.innerWidth);

const resizeWindow = () => {
  const mobileScale = Math.min(
    window.innerWidth/(dims.boxW+2*outerMargin),
    window.innerHeight/(dims.boxH+2*outerMargin));
  const desktopScale = Math.min(1,mobileScale);
  const bodyDiv = document.getElementById("bodydiv");
  bodyDiv.style.scale = device=="DESKTOP" ? desktopScale : mobileScale;
}

window.onresize = resizeWindow;

const updateTimer = () => document.getElementById("timer").innerText=(new Date()).getTime()-startTime;

const copyScore = () => {
  const aux = document.createElement("textarea");
  let s = `${rand ? "Random" : "Daily"} Proset ${n}-dot: ${document.getElementById("timer").innerText/1000}s\n`;
  s += `jchboettcher.github.io/proset-duel/?${rand ? "random" : "daily"}/${n}${rand ? "/"+day : ""}`
  aux.innerHTML = s
  document.body.appendChild(aux);
  aux.select();
  document.execCommand("copy");
  document.body.removeChild(aux);
  alert("Copied results to clipboard!")
}

const stopGame = () => {
  clearInterval(stopTimeId);
  updateTimer();
  document.getElementById("start-text").innerText = "SHARE";
  const share = document.getElementById("start");
  if (device == "DESKTOP") {
    share.onclick = copyScore;
  } else {
    share.ontouchstart = copyScore;
  }
  setTimeout(() => {
    share.style.visibility = "visible";
    share.toggleAttribute("appear",true);
  }, 400);
}

const setProgress = () => {
  const full = dims.boxW+"px";
  const bar = document.getElementById("progress-bar");
  bar.style.transition = "width 0.8s, marginRight 0.8s";
  const progress = deck.filter(e=>e!=undefined).length/(2**n-1);
  if (progress == 0) stopGame();
  bar.style.width = `calc(${full} * ${1-progress})`;
  bar.style.marginRight = `calc(${full} * ${progress})`;
  setTimeout(() => bar.style.transition = "none", 800);
}

const clickCard = id => {
  const card = document.getElementById(id);
  card.toggleAttribute("gone", false);
  if (card.toggleAttribute("selected")) {
    card.style.borderWidth = dims.selectW+"px";
  } else {
    card.toggleAttribute("red", false);
    card.toggleAttribute("toggler", false);
    card.style.borderWidth = dims.borderW+"px";
  }
  jiggleCard(card);
}

const jiggleCard = card => {
  card.removeAttribute("rjiggle");
  card.removeAttribute("ljiggle");
  if (Math.random() < 0.5) card.toggleAttribute("rjiggle");
  else card.toggleAttribute("ljiggle");
}

const createCard = (id,numCols,numRows) => {
  const card = document.createElement("div");
  card.id = id;
  card.className = "card grid";
  card.style.borderWidth = dims.borderW+"px";
  card.style.borderRadius = dims.cardRad+"px";
  if (device == "DESKTOP") {
    card.onclick = () => clickCard(id);
  } else {
    card.ontouchstart = () => clickCard(id);
  }
  let dotCount = 0;
  for (let i = 0; i < numRows; i++) {
    const row = document.createElement("div");
    row.className = "row";
    const y = (-(numRows-1)/2+i)*(dims.dotW+dims.dotBtwn);
    placeElement(row,dims.dotW*numCols+dims.dotBtwn,dims.dotW,0,y);
    for (let j = 0; j < numCols; j++) {
      const dot = document.createElement("div");
      const x = (-(numCols-1)/2+j)*(dims.dotW+dims.dotBtwn);
      placeElement(dot,dims.dotW,dims.dotW,x,0);
      dot.style.visibility = "hidden";
      dot.style.borderWidth = dims.borderW+"px";
      dot.className = "dot";
      if (!(n==7 && i==1 && j==2) && dotCount < n) {
        dot.style.background = colors[dotCount];
        dot.id = id+"dot"+dotCount++;
      }
      row.appendChild(dot);
    }
    card.appendChild(row);
  }
  return card;
}

const placeElement = (el,w,h,x=0,y=0) => {
  el.style.width = w+"px";
  el.style.height = h+"px";
  el.style.marginLeft = -w/2+"px";
  el.style.marginTop = -h/2+"px";
  el.style.left = `calc(50% + ${x}px)`;
  el.style.top = `calc(50% + ${y}px)`;
}

const setUpGameDiv = () => {
  const gameDiv = document.getElementById("game");
  placeElement(gameDiv,dims.boxW,dims.boxH);
  gameDiv.style.borderWidth = dims.borderW+"px";
  gameDiv.className = "grid btwn";
  const bar = document.getElementById("progress-bar");
  placeElement(bar,dims.boxW,0,0,-dims.boxH/2-dims.borderW*1.5);
  bar.style.borderWidth = dims.borderW+"px";
  const rowLens = [
    [[3,2],  [3,2]],
    [[3,3],  [3,3]],
    [[2,3,2],[4,3]],
    [[3,3,2],[4,4]],
    [[3,3,3],[5,4]],
    [[3,4,3],[5,5]]
  ][n-4][scrunch?0:1];
  let cardCount = 0;
  // const ys = [[[-0.5,-0.5],[0.5,0.5]],[[-1,-1]]][numCardRows-2];
  for (let i = 0; i < numCardRows; i++) {
    const row = document.createElement("div");
    row.className = "row";
    const y = (-(numCardRows-1)/2+i)*(dims.cardH+dims.innerBtwn);
    placeElement(row,dims.boxW-2*dims.innerMargin,dims.cardH,0,y)
    for (let j = 0; j < rowLens[i]; j++) {
      const card = createCard("card"+(cardCount++),numDotCols,numDotRows);
      card.style.visibility = "hidden";
      const x = (-(rowLens[i]-1)/2+j)*(dims.cardW+dims.innerBtwn);
      placeElement(card,dims.cardW,dims.cardH,x,0);
      row.appendChild(card);
    }
    gameDiv.appendChild(row);
  }
  const startDiv = document.getElementById("start");
  placeElement(startDiv,dims.cardH*2,dims.cardH);
  startDiv.style.borderWidth = dims.selectW+"px";
  startDiv.style.borderRadius = dims.cardRad+"px";
  startDiv.style.fontSize = dims.cardH/5+"px";
  const startText = document.getElementById("start-text")
  startText.innerText = "START";
  startText.style.height = dims.cardH+"px";
  gameDiv.appendChild(startDiv);
  if (device == "DESKTOP") {
    startDiv.onclick = startGame;
  } else {
    startDiv.ontouchstart = startGame;
  }
}

// const makeAllClickable = () => {
//   [...document.querySelectorAll("*")].forEach(el => {
//     if (!el.onclick) el.onclick = e => {e.preventDefault()};
//   })
// }

const showCards = () => {
  for (let i = 0; i < n+1; i++) {
    const card = document.getElementById("card"+i);
    card.toggleAttribute("appear",true);
    card.style.visibility = "visible";
    setTimeout(() => card.toggleAttribute("appear",false),400);
  }
  startTime = (new Date()).getTime();
  stopTimeId = setInterval(updateTimer,13);
}

const syncGameToDeck = () => {
  for (let i = 0; i < n+1; i++) {
    if (!deck[i]) {
      document.getElementById("card"+i).style.visibility = "hidden";
      for (let j = 0; j < n; j++) {
        document.getElementById("card"+i+"dot"+j).style.visibility = "hidden";
      }
      continue;
    }
    let s = deck[i].toString(2);
    s = "0".repeat(n-s.length) + s;
    // console.log(s);
    for (let j = 0; j < n; j++) {
      document.getElementById("card"+i+"dot"+j).style.visibility = s[j]=="1" ? "visible" : "hidden";
    }
  }
}

const startGame = () => {
  document.getElementById("start").style.visibility = "hidden";
  setProgress();
  showCards();
  syncGameToDeck();
}

setUpGameDiv();
resizeWindow();
makeDeck();
// if (device != "DESKTOP") makeAllClickable();
