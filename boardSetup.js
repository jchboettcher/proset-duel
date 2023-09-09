let startTime;
const heatTimes = [0];
const setSizes = [];
let wrongSubmits = 0;
let totalSelects = 0;
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

const outerMargin = device=="DESKTOP" ? 100 : 50;         // px
const innerMarginUnits = device=="DESKTOP" ? 5/6 : 3/6;   // wrt cardH
const innerBtwnUnits = 1/6;                               // wrt cardH
const cornerRatio = 0.07;                                 // wrt cardH
const dotScale = 1.35;                                    // wrt dividing card evenly (btwn==dot)
const fixedCardW = device=="DESKTOP" ? 10 : 20;           // vw
const borderW = device=="DESKTOP" ? 1.666 : 2;            // % of cardH
const selectW = device=="DESKTOP" ? 2.85 : 3.431;         // % of cardH
const extraSlide = device=="DESKTOP" ? 0 : 50;            // vh

const getDimensions = vw => {
  const numCardCols = [[3,3],[3,3],[3,4],[3,4],[3,5],[4,5]][n-4][scrunch?0:1];
  const numDotCols = n>6 ? 3 : 2;
  const numCardRows = (scrunch && n > 5) ? 3 : 2;
  const numDotRows = n>4 ? 3 : 2;

  const cardH = fixedCardW/100*vw;
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
  const bodyDiv = document.getElementById("bodydiv");
  bodyDiv.style.top = `${window.innerHeight/2}px`;
  const outmost = document.getElementById("outmost");
  outmost.style.width = window.innerWidth+"px";
  outmost.style.height = window.innerHeight*(100+extraSlide)/100+"px";
  const mobileScale = Math.min(
    window.innerWidth/(dims.boxW+2*outerMargin),
    window.innerHeight/(dims.boxH+2*outerMargin));
  const desktopScale = Math.min(1,mobileScale);
  bodyDiv.style.scale = device=="DESKTOP" ? desktopScale : mobileScale;
}

window.onresize = resizeWindow;

const formatTime = t => {
  let secs = ((Math.floor(t/10) % 6000)/100).toString();
  const mins = Math.floor(t/1000/60) % 60;
  const hrs = Math.floor(t/1000/60/60);
  if (!secs.includes(".")) secs += ".00";
  if (secs[secs.length-2] == ".") secs += "0";
  if (hrs == 0 && mins == 0) return `${secs}s`;
  if (secs[1] == ".") secs = "0" + secs;
  if (hrs == 0) return `${mins}:${secs}`;
  return `${hrs}:${mins<10 ? 0 : ""}${mins}:${secs}`;
}

const updateTimer = () => document.getElementById("timer").innerText=formatTime((new Date()).getTime()-startTime);

const getResults = (sharing=false) => {
  // const formatTime = t => {
  //   const sec = (t/1000).toString();
  //   const period = sec.indexOf(".");
  //   if (period == -1) return sec+".000";
  //   return sec+"0".repeat(4-(sec.length-period));
  // }
  const percent = r => {
    const out = Math.round(setSizes.reduce((a,b)=>a+b)/totalSelects*1000);
    if (out % 10 == 0) return out/10+".0";
    return out/10;
  }
  const diffs = [...setSizes.keys()].map(i => [heatTimes[i+1]-heatTimes[i],setSizes[i],i]);
  const bestSet = diffs.reduce((min, el) => (el[0] < min[0] ? el : min));
  const bestNonLast = diffs.slice(0,setSizes.length-1).reduce((min, el) => (el[0] < min[0] ? el : min));
  const worstSet = diffs.reduce((max, el) => (el[0] > max[0] ? el : max));
  return [
    `Time: ${formatTime(heatTimes[heatTimes.length-1])}`,
    `Set accuracy: ${setSizes.length}/${setSizes.length+wrongSubmits}${(wrongSubmits==0 && sharing) ? " 💯" : ""}`,
    `Card accuracy: ${percent(setSizes.reduce((a,b)=>a+b)/totalSelects*1000)}%`,
    `Best set: ${formatTime(bestSet[0])} (#${bestSet[2]+1}: ${bestSet[1]})`,
    `Best non-last: ${formatTime(bestNonLast[0])} (#${bestNonLast[2]+1}: ${bestNonLast[1]})`,
    `Worst set: ${formatTime(worstSet[0])} (#${worstSet[2]+1}: ${worstSet[1]})`,
  ]
}

const copyScore = () => {
  const aux = document.createElement("textarea");
  let s = `${rand ? "Random" : "Daily"} ${n}-dot ProSet${rand ? "" : (" #"+"0".repeat(Math.max(4-day.toString().length,0))+day)}\n`;
  s += getResults(true).join("\n")+"\n";
  s += `jchboettcher.github.io/proset-duel/?${rand ? "random" : "daily"}/${n}${rand ? "/"+day : ""}`;
  // navigator.share(s);
  aux.innerHTML = s;
  document.body.appendChild(aux);
  aux.select();
  // document.execCommand("copy");
  // alert(`Copied results to clipboard!: ${aux.value}`);
  // document.body.removeChild(aux);
  aux.setSelectionRange(0,99999);
  try {
    navigator.clipboard
      .writeText(aux.value)
      .then(() => {
        alert("Copied results to clipboard!");
      })
  } catch(e) {
    alert("Sorry, unable to copy results.");
  };
  document.body.removeChild(aux);
}

const stopGame = () => {
  document.querySelector(':root').style.setProperty("--can-select","text");
  clearInterval(stopTimeId);

  // heatTimes[heatTimes.length-1] *= 1000;
  // setSizes[setSizes.length-1] = 10;
  // setSizes.push(2);
  // setSizes.push(2);
  // heatTimes.push(12345);
  // heatTimes.push(12345);

  document.getElementById("start").style.visibility = "hidden";
  document.getElementById("timer").innerText = formatTime(heatTimes[heatTimes.length-1]);
  const resultsDiv = document.createElement("div");
  resultsDiv.id = "resultsDiv";
  resultsDiv.style.visibility = "hidden";
  resultsDiv.style.fontSize = dims.cardH/6+"px";
  const lineWidth = dims.cardH*2.5;
  const lineHeight = dims.cardH/4.5;
  const shareHeight = dims.cardH*0.4;
  const spacer = dims.cardH/15;
  // const btwnShareNew = lineWidth-2*shareWidth);
  const btwnShareNew = spacer*1.2;
  const shareWidth = (lineWidth-btwnShareNew)/2;
  const resultHeight = lineHeight*6+shareHeight+spacer;
  resultsDiv.style.lineHeight = lineHeight+"px";
  placeElement(resultsDiv,lineWidth,resultHeight,0,0,46);
  const results = getResults();
  for (let i = 0; i < results.length; i++) {
    const resultString = results[i];
    const resultLine = document.createElement("div");
    const resultLeft = document.createElement("div");
    const resultRight = document.createElement("div");
    resultLine.className = "resultLine";
    resultLeft.className = "resultLeft";
    resultRight.className = "resultRight";
    resultLine.appendChild(resultLeft);
    resultLine.appendChild(resultRight);
    const splitResult = resultString.split(": ");
    resultLeft.innerText = splitResult[0]+": ";
    resultRight.innerText = splitResult.slice(1).join(": ");
    // resultLine.innerText = resultString;
    placeElement(resultLine,lineWidth,lineHeight,0,-resultHeight/2+lineHeight*(i+0.5));
    resultsDiv.appendChild(resultLine);
  }
  document.getElementById("game").appendChild(resultsDiv);
  const share = document.createElement("div");
  share.id = "share";
  resultsDiv.appendChild(share);
  placeElement(share,shareWidth,shareHeight,-(shareWidth+btwnShareNew)/1.98,(resultHeight-shareHeight)/2);
  share.style.borderWidth = (device=="DESKTOP" ? dims.selectW*0.75 : dims.borderW)+"px";
  share.style.borderRadius = dims.cardRad+"px";
  share.style.fontSize = dims.cardH/6.6+"px";
  const shareText = document.createElement("h4");
  shareText.id = "share-text";
  placeElement(shareText,shareWidth,shareHeight);
  shareText.style.lineHeight = shareHeight+"px";
  shareText.innerText = "SHARE";
  share.appendChild(shareText);
  if (device != "DESKTOP") {
    share.ontouchstart = () => {};
  }
  share.onclick = copyScore;
  const newButton = document.createElement("div");
  newButton.id = "new";
  resultsDiv.appendChild(newButton);
  placeElement(newButton,shareWidth,shareHeight,(shareWidth+btwnShareNew)/1.98,(resultHeight-shareHeight)/2);
  newButton.style.borderWidth = (device=="DESKTOP" ? dims.selectW*0.75 : dims.borderW)+"px";
  newButton.style.borderRadius = dims.cardRad+"px";
  newButton.style.fontSize = dims.cardH/6.6+"px";
  const newText = document.createElement("h4");
  newText.id = "share-text";
  placeElement(newText,shareWidth,shareHeight);
  newText.style.lineHeight = shareHeight+"px";
  newText.innerText = "NEW";
  newButton.appendChild(newText);
  if (device != "DESKTOP") {
    newButton.ontouchstart = () => {};
  }
  newButton.onclick = () => window.location.search = `?random/${n}`;
  setTimeout(() => {
    resultsDiv.style.visibility = "visible";
    resultsDiv.toggleAttribute("appear",true);
  }, 400);
}

const setProgress = () => {
  const full = dims.boxW+"px";
  const bar = document.getElementById("progress-bar");
  bar.style.transition = "width 0.8s, marginRight 0.8s";
  const progress = deck.filter(e=>e!=undefined).length/(2**n-1);
  document.getElementById("cardsLeft").innerText = `${Math.max(0,deck.filter(e=>e!=undefined).length)} left`;
  if (progress == 0) stopGame();
  bar.style.width = `calc(${full} * ${1-progress})`;
  bar.style.marginRight = `calc(${full} * ${progress})`;
  setTimeout(() => bar.style.transition = "none", 800);
}

const clickCard = id => {
  const card = document.getElementById(id);
  // card.toggleAttribute("gone", false);
  // console.log(card.getAttribute("gone"));
  if (card.toggleAttribute("selected")) {
    card.style.borderWidth = dims.selectW+"px";
    totalSelects++;
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
    // card.onclick = () => clickCard(id);
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

const placeElement = (el,w,h,x=0,y=0,fifty=50) => {
  el.style.width = w+"px";
  el.style.height = h+"px";
  el.style.marginLeft = -w/2+"px";
  el.style.marginTop = -h/2+"px";
  el.style.left = `calc(50% + ${x}px)`;
  el.style.top = `calc(${fifty}% + ${y}px)`;
}

const setUpGameDiv = () => {
  const outmost = document.getElementById("outmost");
  outmost.style.width = window.innerWidth+"px";
  outmost.style.height = window.innerHeight*(100+extraSlide)/100+"px";
  const bodyDiv = document.getElementById("bodydiv");
  // bodyDiv.style.width = (dims.boxW+2*outerMargin)+"px";
  // bodyDiv.style.height = (dims.boxH+2*outerMargin)+"px";
  // bodyDiv.style.top = "0px";
  // bodyDiv.style.left = "0px";
  placeElement(bodyDiv,dims.boxW+2*outerMargin,dims.boxH+2*outerMargin);
  bodyDiv.style.top = `${window.innerHeight/2}px`;
  // bodyDiv.style.top = "50%";
  const gameDiv = document.getElementById("game");
  placeElement(gameDiv,dims.boxW,dims.boxH);
  gameDiv.style.borderWidth = dims.borderW+"px";
  gameDiv.className = "grid";
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
    row.className = "row canSubmit";
    const y = (-(numCardRows-1)/2+i)*(dims.cardH+dims.innerBtwn);
    placeElement(row,dims.boxW-2*dims.innerMargin,dims.cardH,0,y,48.3);
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
  placeElement(startDiv,dims.cardH*2,dims.cardH,0,0,48.3);
  startDiv.style.borderWidth = dims.selectW+"px";
  startDiv.style.borderRadius = dims.cardRad+"px";
  startDiv.style.fontSize = dims.cardH/5+"px";
  const startText = document.getElementById("start-text")
  startText.innerText = "START";
  startText.style.lineHeight = dims.cardH+"px";
  placeElement(startText,dims.cardH*2,dims.cardH)
  gameDiv.appendChild(startDiv);
  if (device == "DESKTOP") {
    startDiv.onclick = startGame;
  } else {
    startDiv.ontouchstart = startGame;
    // startDiv.onclick = startGame;
  }
  const timer = document.createElement("div");
  timer.id = "timer";
  timer.className = "canSubmit";
  timer.innerText = formatTime(0);
  timer.style.fontSize = dims.cardH/6+"px";
  timer.style.top = dims.cardH/20+"px";
  timer.style.left = dims.cardH/20+"px";
  gameDiv.appendChild(timer);
  const cardsLeft = document.createElement("div");
  cardsLeft.id = "cardsLeft";
  cardsLeft.className = "canSubmit";
  cardsLeft.innerText = `${2**n-1} left`;
  cardsLeft.style.fontSize = dims.cardH/6+"px";
  cardsLeft.style.top = dims.cardH/20+"px";
  cardsLeft.style.right = dims.cardH/20+"px";
  gameDiv.appendChild(cardsLeft);
  const gameTitle = document.createElement("div");
  gameTitle.id = "gameTitle";
  gameTitle.className = "canSubmit";
  gameTitle.innerText = `${rand ? "Random" : "Daily"} ${n}-dot ProSet${rand ? "" : (" #"+"0".repeat(Math.max(4-day.toString().length,0))+day)}`;
  gameTitle.style.fontSize = dims.cardH/4.5+"px";
  gameTitle.style.width = dims.boxW+"px"
  gameTitle.style.marginLeft = -dims.boxW/2+"px";
  gameDiv.appendChild(gameTitle);
}

const makeAllClickable = () => {
  [...document.querySelectorAll("*")].forEach(el => {
    el.onclick = () => {};
  })
}

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
  document.querySelector(':root').style.setProperty("--can-select","none");
  document.getElementById("start").style.visibility = "hidden";
  setProgress();
  showCards();
  syncGameToDeck();
  window.scrollTo(0, 1);
  // if (device != "DESKTOP") {
  //   window.addEventListener("load", () => setTimeout(window.scrollTo(0, 1)), 30);
  //   window.addEventListener("orientationchange", () => setTimeout(window.scrollTo(0, 1)), 30);
  // }
}

setUpGameDiv();
resizeWindow();
makeDeck();
if (device != "DESKTOP") makeAllClickable();
