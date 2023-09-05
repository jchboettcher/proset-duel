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
document.querySelector(':root').style.setProperty("--device",device=="DESKTOP" ? "medium" : "thick");
// const scrunchRatios = [1,1,0.795,0.826,0.9,0.872];
const desktopScale = 1;
// const desktopScale = device=="DESKTOP" ? (scrunch ? 0.85 : 0.75) : 1;

const cardUnits = 6;
const innerMarginUnits = 4;
const innerBtwnUnits = 1;
const cornerRatio = 0.07;
const dotScale = 1.25;
const outerMargin = 10;
const fixedCardW = 11;

const getDimensionsFixed = (vw,numCardCols,numCardRows,numDotCols,numDotRows) => {
  const cardW = fixedCardW/100*vw;
  const baseUnit = cardW/cardUnits;
  const innerMargin = baseUnit*innerMarginUnits;
  const innerBtwn = baseUnit*innerBtwnUnits;
  const cardRad = cardW*cornerRatio;
  const boxW = 2*innerMargin+(numCardCols-1)*innerBtwn+numCardCols*cardW;
  const dotW = cardW*dotScale/(numDotCols*2+1);
  const dotBtwn = (cardW-dotW*numDotCols)/(numDotCols+1);
  const cardH = dotW*numDotRows+dotBtwn*(numDotRows+1);
  const boxH = cardH*numCardRows+(numCardRows-1)*innerBtwn+2*innerMargin;

  return {
    fullBoxW: boxW,
    boxH: boxW-innerMargin*2,
    boxW: boxH-innerMargin*2,
    innerMargin, innerBtwn, cardW: cardH, cardH: cardW, cardRad, dotW, dotBtwn,
    extraPadding: (cardH+innerBtwn)/2,
  }
}

const getDimensions = (vw) => {
  // layout stuff
  const numCardCols = [[],[],[],[],[3,3],[3,3],[3,4],[3,4],[3,5],[4,5]][n][scrunch?0:1];
  const numDotCols = n>6 ? 3 : 2;
  const numCardRows = (scrunch && n > 5) ? 3 : 2;
  const numDotRows = n>4 ? 3 : 2;

  // with respect to total width:
  const totalW = 100;
  const boxW = totalW-2*outerMargin;
  const baseUnit = boxW/(innerMarginUnits*2+(numCardCols-1)*innerBtwnUnits+numCardCols*cardUnits);
  const innerMargin = baseUnit*innerMarginUnits;
  const innerBtwn = baseUnit*innerBtwnUnits;
  const cardW = baseUnit*cardUnits;
  const cardRad = cardW*cornerRatio;
  const dotW = cardW*dotScale/(numDotCols*2+1);
  const dotBtwn = (cardW-dotW*numDotCols)/(numDotCols+1);
  const cardH = dotW*numDotRows+dotBtwn*(numDotRows+1);
  const boxH = cardH*numCardRows+(numCardRows-1)*innerBtwn+2*innerMargin;
  const totalH = boxH+2*outerMargin;
  const hScale = totalW/totalH;
  return {
    numCardCols,
    numCardRows,
    numDotCols,
    numDotRows,
    dims: {
      vw: {
        fullBoxW: boxW,
        boxW: boxW-innerMargin*2,
        boxH: boxH-innerMargin*2,
        innerMargin, innerBtwn, cardW, cardH, cardRad, dotW, dotBtwn,
        extraPadding: (cardW+innerBtwn)/2,
      },
      hScale,
      fixed: getDimensionsFixed(vw,numCardRows,numCardCols,numDotRows,numDotCols),
    },
  }
}

const {numCardCols,numCardRows,numDotCols,numDotRows,dims} = getDimensions(window.innerWidth);

const getAttribute = key => {
  const {vw,hScale,fixed} = dims;
  const marginString = `min(${vw[key]}dvw,${vw[key]*hScale}dvh)`;
  if (device != "DESKTOP") return marginString;
  return `min(${marginString},${fixed[key]}px)`;
}
// const getAttribute = ({vw,vh},key) => `${vw[key]}vw`;

const getFullProgress = () => {
  const baseW = getAttribute("boxW");
  const padW = getAttribute("innerMargin");
  return `calc(calc(${baseW} + ${padW}) + ${padW})`;
}
const setProgress = (smooth=true) => {
  const full = getFullProgress();
  // return "100%"
  // return `calc(${getFullProgress()} * 1)`;
  const bar = document.getElementById("progress-bar");
  if (smooth) bar.style.transition = "width 0.8s, margin 0.8s";
  const progress = deck.filter(e=>e!=undefined).length/(2**n-1);
  bar.style.width = `calc(${full} * ${1-progress})`;
  bar.style.marginRight = `calc(${full} * ${progress})`;
  setTimeout(() => bar.style.transition = "none", 800);
}

const clickCard = id => {
  const card = document.getElementById(id);
  card.toggleAttribute("gone", false);
  if (!card.toggleAttribute("selected")) {
    card.toggleAttribute("red", false);
    card.toggleAttribute("toggler", false);
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
  card.style.width = getAttribute("cardW");
  card.style.height = getAttribute("cardH");
  // card.style.display = "flex";
  // card.style.flexDirection = "column";
  // card.style.justifyContent = "space-evenly";
  // card.style.background = "white";
  card.style.borderRadius = getAttribute("cardRad");
  // card.style.borderWidth = getAttribute("borderWidth");
  if (device == "DESKTOP") {
    card.onclick = () => clickCard(id);
  } else {
    card.ontouchstart = () => clickCard(id);
  }
  let dotCount = 0;
  for (let i = 0; i < numRows; i++) {
    const row = document.createElement("div");
    row.className = "row";
    for (let j = 0; j < numCols; j++) {
      const dot = document.createElement("div");
      dot.style.width = getAttribute("dotW");
      dot.style.height = getAttribute("dotW");
      dot.style.visibility = "hidden";
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

// const addSpacer = (el,dir) => {
//   const spacer = document.createElement("div");
//   spacer.style[dir] = getAttribute("innerMargin");
//   el.appendChild(spacer);
// }

const setUpGameDiv = () => {
  const gameDiv = document.getElementById("game");
  // console.log(2*dims.vw.innerMargin+numCardCols*dims.vw.cardW+(numCardCols-1)*dims.vw.innerBtwn,dims.vw.boxW)
  // console.log(2*dims.vw.innerMargin+numCardRows*dims.vw.cardW+(numCardRows-1)*dims.vw.innerBtwn,dims.vw.boxH)
  // console.log(2*dims.vh.innerMargin+numCardCols*dims.vh.cardW+(numCardCols-1)*dims.vh.innerBtwn,dims.vh.boxW)
  // console.log(2*dims.vh.innerMargin+numCardRows*dims.vh.cardW+(numCardRows-1)*dims.vh.innerBtwn,dims.vh.boxH)
  gameDiv.style.width = getAttribute("boxW");
  gameDiv.style.height = getAttribute("boxH");
  gameDiv.style.padding = getAttribute("innerMargin");
  gameDiv.className = "grid btwn";
  // const progressDiv = document.getElementById("pr");
  // progressDiv.style.width = getFullProgress();
  // progressDiv.style.translate = getProgressTranslate();
  // console.log(`-${getAttribute("innerMargin")} -${getAttribute("innerMargin")}`);
  // progressBar.style.height = 0;
  const rowLens = [[],[],[],[],
    [[3,2],  [3,2]],
    [[3,3],  [3,3]],
    [[2,3,2],[4,3]],
    [[3,3,2],[4,4]],
    [[3,3,3],[5,4]],
    [[3,4,3],[5,5]]
  ][n][scrunch?0:1];
  let cardCount = 0;
  for (let i = 0; i < numCardRows; i++) {
    const row = document.createElement("div");
    row.className = "row btwn";
    if (rowLens[i] < numCardCols) {
      row.style.paddingLeft = getAttribute("extraPadding");
      row.style.paddingRight = getAttribute("extraPadding");
    }
    for (let j = 0; j < rowLens[i]; j++) {
      row.appendChild(createCard("card"+(cardCount++),numDotCols,numDotRows));
    }
    gameDiv.appendChild(row);
  }
}

const makeAllClickable = () => {
  [...document.querySelectorAll("*")].forEach(el => {
    if (!el.onclick) el.onclick = () => {};
  })
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

setUpGameDiv();
makeDeck();
setProgress(false);
makeAllClickable();
syncGameToDeck();
