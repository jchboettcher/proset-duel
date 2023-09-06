const disappearSet = () => {
  [...document.querySelectorAll("[selected]")].forEach(el=>{
    el.toggleAttribute("gone",true);
    el.toggleAttribute("selected",false);
    el.style.borderWidth = dims.borderW+"px";
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
    selected.forEach(el=>{
      el.toggleAttribute("toggler");
      el.toggleAttribute("red",true);
      jiggleCard(el);
    });
  } else {
    let j = n+1;
    for (let i = 0; i <= n; i++) {
      if (s[i] == "1") deck[i] = deck.splice(j,1)[0];
    }
    disappearSet();
    setProgress();
    setTimeout(syncGameToDeck,350);
    resetAttributes();
  }
}

document.onkeyup = e => {
  if (e.key == "Enter") {
    submitSet();
  }
}

const bodyDiv = document.getElementById("bodydiv");
const gameDiv = document.getElementById("game");

const bodyDivClick = e => {
  if (bodyDiv !== e.target) return;
  [...document.querySelectorAll("[selected]")].forEach(el=>{
    el.toggleAttribute("selected",false);
    el.toggleAttribute("red", false);
    el.toggleAttribute("toggler", false);
    el.style.borderWidth = dims.borderW+"px";
  });
}

const gameDivClick = e => {
  const classList = e.target.classList
  if (gameDiv != e.target && !classList.contains("btwn")) return;
  submitSet();
}

if (device == "DESKTOP") {
  bodyDiv.onclick = bodyDivClick;
  gameDiv.onclick = gameDivClick;
} else {
  bodyDiv.ontouchstart = bodyDivClick;
  gameDiv.ontouchstart = gameDivClick;
}
