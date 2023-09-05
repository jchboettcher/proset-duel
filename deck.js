let rand = false;
const search = window.location.search;
let n = parseInt(search.substring(1));
const date = new Date();
// let day = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000) - (date.getFullYear()-2022)*365 - 42
let day = Math.floor((date - new Date(2023, 8, 0)) / 86400000);
// console.log(search);
const possrand = () => {
  const d = Math.floor(Math.random()*1000000000);
  return "0".repeat(9-(d.toString()).length)+d;
}
if (search.length && !isNaN(search.substring(1))) {
  if (n > 3 && n < 10) {
    window.location.search = "?daily/"+n
  } else if (n < -3 && n > -10) {
    window.location.search = "?random/"+(-n)+"/"+possrand()
  } else {
    window.location.search = ""
  }
} else if (search.length) {
  const params = search.split("/")
  // console.log(params)
  if (!["?daily","?random"].includes(params[0])) {
    window.location.search = "";
  } else if (params.length == 1) {
    window.location.search = params[0]+"/6";
  } else {
    n = parseInt(params[1])
    if (isNaN(params[1]) || n < 4 || n > 9) {
      window.location.search = ""
    } else {
      rand = params[0] == "?random";
      if (rand) {
        const newrandstr = params[0]+"/"+params[1]+"/"
        if (params.length == 2) {
          window.location.search = newrandstr+possrand()
        } else if (params.length > 2) {
          // console.log(params[2])
          day = parseInt(params[2])
          if (params[2] == "" || isNaN(params[2]) || day >= 1000000000 || day < 0) {
            window.location.search = newrandstr+possrand();
          } else if (params.length > 3) {
            window.location.search = newrandstr+day;
          } else if (params[2].length != 9) {
            window.location.search = newrandstr+"0".repeat(9-params[2].length)+params[2];
          }
        }
      } else {
        if (params.length > 2) {
          window.location.search = params[0]+"/"+params[1];
        }
      }
    }
  }
}

let deck = [];
let refreshAttempts = 100;

const hashStr = (num,attempt) => {
  let h1 = 0xdeadbeef+n+num*10+attempt*20000, h2 = 0x41c6ce57+day+(rand ? 1000000 : 0);
  const str = num.toString(2)+num.toString(3)+(num**2+num).toString(16);
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
  h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1>>>0);
}

const getSets = (cards) => {
  const found = [];
  const m = cards.length;
  for (let i = 2**m-1; i > 6; i--) {
    let s = (i).toString(2);
    if (s.split("1").length-1 >= 3) {
      s = "0".repeat(m-s.length) + s;
      let tot = 0;
      for (let j = 0; j < m; j++) {
        if (s[j] == "1") tot ^= cards[j];
      }
      if (!tot) {
        found.push(s);
      }
    }
  }
  if (!found.length) throw Error("no set found: "+cards.toString());
  return found;
}

const getRest = (deck) => {
  while (!!deck.length) {
      const cards = deck.slice(0,n+1);
      const sets = getSets(cards);
      if (sets.every(s => (
        deck.length-(s.split("1").length-1) <= n+1
      ))) return 0;
      if (sets.length > 1) return deck.length;
      const set = sets[0];
      for (let i = cards.length-1; i >= 0; i--) {
        if (set[i] == "1") deck.splice(i,1);
      }
  }
  throw Error("Can't get here!")
}

const deckWorks = (deck) => {
  return getRest(deck) == 0;
}

const makeDeck = () => {
  let startAttempt = 0;
  while (true) {
    const order = []
    for (let i = 1; i < 2**n; i++) {
      order.push(i);
    }
    order.sort((a,b)=>hashStr(a,0)-hashStr(b,0));
    deck.length = 0;
    let idxs = [];
    let fixed = 0;
    let attempt = startAttempt;
    while (!!order.length && attempt < startAttempt + refreshAttempts) {
      let sets = [0,0];
      let cards;
      attempt = startAttempt;
      do {
        for (let i = fixed; i <= n; i++) {
          let j = hashStr(i,attempt) % order.length;
          let adder = 1;
          while (idxs.slice(0,i).includes(j)) {
            j = hashStr(i,attempt+adder++) % order.length;
          }
          idxs[i] = j;
        }
        cards = idxs.map(i=>order[i]);
        if (cards[0] == undefined) return false;
        sets = getSets(cards);
        if (sets.every(s => (
          order.length-(s.split("1").length-1) <= n+1
        ))) {
          idxs.sort((i,j)=>i-j).reverse().forEach(i => {
            if (!deck.includes(order[i])) deck.push(order[i]);
            order.splice(i,1);
          });
          order.forEach(c => deck.push(c));
          return (attempt-startAttempt+1);
        }
        attempt++;
      } while (sets.length > 1 && attempt < startAttempt + refreshAttempts);
      if (sets.length > 1) break;
      const usedCards = [];
      for (let i = 0; i <= n; i++) {
        if (sets[0][i] == "1") usedCards.push(cards[i]);
      }
      const fixedCards = [];
      idxs.sort((i,j)=>i-j).reverse().forEach(i => {
        if (!deck.includes(order[i])) deck.push(order[i]);
        if (!usedCards.includes(order[i])) {
          fixedCards.push(order[i]);
          return
        }
        order.splice(i,1);
      });
      idxs = [];
      for (c of fixedCards) {
        idxs.push(order.indexOf(c));
      }
      fixed = idxs.length;
    }
    if (attempt < startAttempt + refreshAttempts)
      throw Error("Can't get here!");
    startAttempt = attempt;
  }
}

const testUnique = N => {
  const history = {};
  let maxAtt = 0;
  let maxTime = 0;
  let totTime = 0;
  for (let i = 8000; i <= 8000+N-1; i++) {
    // console.log("running "+n);
    day = i;
    const d =  (new Date()).getTime()
    const att = makeDeck() - 1;
    if (att == -1) console.warn("returned FALSE");
    if (deck.length != 2**n-1) console.warn("not right length");
    if (!deckWorks(deck.slice())) console.warn("deck doesn't work");
    const t =  (new Date()).getTime()-d;
    totTime += t;
    if (att > maxAtt || t > maxTime) {
      // console.log(i,att,t/1000,totTime/i/1000);
      if (att > maxAtt) maxAtt = att;
      if (t > maxTime) maxTime = t;
    }
    if (!!history[deck.toString()]) console.warn("Same",history[deck.toString()],i)
    history[deck.toString()] = i;
  }
  // console.log(n,"SUMMARY:");
  console.log("  avg:",totTime/N/1000);
  console.log("  max:",maxTime/1000);
  console.log("  att:",maxAtt);
}

const testRefreshAttempts = () => {
  for (let i = 1; i < 15; i++) {
    refreshAttempts = i*20;
    console.log("REFRESH:",refreshAttempts);
    n = 9;
    testUnique(2000);
  }
}
