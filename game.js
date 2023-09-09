const disappearSet = () => {
  [...document.querySelectorAll("[selected]")].forEach(el=>{
    el.toggleAttribute("gone",true);
    el.toggleAttribute("appear",false);
    el.toggleAttribute("selected",false);
    el.style.borderWidth = dims.borderW+"px";
    setTimeout(() => el.toggleAttribute("gone",false), 700);
  });
}

const resetAttributes = () => {
  [...document.querySelectorAll(".card")].forEach(el=>{
    el.toggleAttribute("selected",false);
    el.toggleAttribute("red",false);
    el.toggleAttribute("rjiggle",false);
    el.toggleAttribute("ljiggle",false);
    el.toggleAttribute("toggler",false);
    el.style.borderWidth = dims.borderW+"px";
  });
}

const submitSet = () => {
  const selected = [...document.querySelectorAll("[selected]")];
  const selectedIds = selected.map(({id})=>parseInt(id[4]));
  const s = [...Array(n+1).keys()].map(i=>selectedIds.includes(i)?1:0).join("");
  const correctSet = getSets(deck.slice(0,n+1)).includes(s);
  if (!correctSet) {
    if (s.includes("1")) wrongSubmits++;
    selected.forEach(el=>{
      el.toggleAttribute("toggler");
      el.toggleAttribute("red",true);
      jiggleCard(el);
    });
  } else {
    heatTimes.push((new Date()).getTime()-startTime);
    setSizes.push(s.split("1").length-1);
    let j = n+1;
    for (let i = 0; i <= n; i++) {
      if (s[i] == "1") deck[i] = deck.splice(j,1)[0];
    }
    setProgress();
    disappearSet();
    setTimeout(syncGameToDeck,350);
    resetAttributes();
  }
}

document.onkeyup = e => {
  if (e.key == "Enter") {
    submitSet();
  }
}

const outmostDiv = document.getElementById("outmost");
const bodyDiv = document.getElementById("bodydiv");
const gameDiv = document.getElementById("game");

const deselectAll = () => {
  [...document.querySelectorAll("[selected]")].forEach(el=>{
    el.toggleAttribute("selected",false);
    el.toggleAttribute("red", false);
    el.toggleAttribute("toggler", false);
    el.style.borderWidth = dims.borderW+"px";
  });
}

const outmostClick = e => {
  if (outmostDiv !== e.target) return;
  deselectAll();
}

const bodyDivClick = e => {
  if (bodyDiv !== e.target) return;
  deselectAll();
}

const gameDivClick = e => {
  const classList = e.target.classList
  if (gameDiv != e.target && !classList.contains("canSubmit")) return;
  submitSet();
}

if (device == "DESKTOP") {
  outmostDiv.onclick = outmostClick;
  bodyDiv.onclick = bodyDivClick;
  gameDiv.onclick = gameDivClick;
} else {
  outmostDiv.ontouchstart = outmostClick;
  bodyDiv.ontouchstart = bodyDivClick;
  gameDiv.ontouchstart = gameDivClick;
  // document.body.onclick = bodyClick;
  // bodyDiv.onclick = bodyDivClick;
  // gameDiv.onclick = gameDivClick;
}
