/* OFFLINE DICE shared engine — ES5-compatible for Windows HTA. */
(function () {
  "use strict";
  var COLORS = [
    {name:"RED", value:"#f12c38"}, {name:"ORANGE", value:"#ff9700"},
    {name:"YELLOW", value:"#ffd51b"}, {name:"GREEN", value:"#16c96b"},
    {name:"BLUE", value:"#173cff"}, {name:"PURPLE", value:"#85008e"}
  ];
  var THEMES = [
    {name:"BLACK", colors:["#20252c"]}, {name:"BLUE", colors:["#173cff"]},
    {name:"GREEN", colors:["#16c96b"]}, {name:"YELLOW", colors:["#ffd51b"]},
    {name:"RED", colors:["#f12c38"]}, {name:"PURPLE", colors:["#85008e"]},
    {name:"ORANGE", colors:["#ff9700"]}, {name:"HEAVEN", colors:["#65d8ff","#d5f6ff","#547dff"]},
    {name:"RONALDO", colors:["#e31b23","#fff"]}, {name:"LA PEACE", colors:["#7ad9c5","#f5e8c8"]},
    {name:"DARK FANTASY", colors:["#261c42","#7b3f91","#161626"]}, {name:"DESSERT", colors:["#d68b4c","#f1c27d","#8c4c2d"]},
    {name:"SASUKE", colors:["#223b94","#7134c7","#d7d9f2"]}, {name:"MENTALIST", colors:["#171717","#d6b65c"]},
    {name:"CHILLING RICK", colors:["#79d7cf","#a7e85c","#583b8d"]}
  ];
  var STREAMERS = [
    ["TKrots","@TKrots","🌿"],["BloxTapped","@BloxTapped","💜"],["MEDX","@medxlive","🎧"],
    ["FROZY","@frozy777","❄️"],["CYOOIELWRLD","@cyooielwrld","🌈"],["FortiFacts","@FortiFacts","🎮"],
    ["VoidSlox","@VoidSloxYT","🌑"],["Panda Z Greyzen","@PZG","🐼"],["BeanieRot","@BeanieRot","🧢"],
    ["Blinder","@BlinderFps","🔥"],["DRAVENOX","@not.zzind","⚡"],["LIAM KING","@liamking_4000","👑"],
    ["DARKSON","@darkson__son","🌌"],["SIN_YOU85","@sin_you85","☀️"],["sugar stalker","@sugar_stalker","🍬"],
    ["iceytrades","@Iceytradess","🧊"],["Rhinotrades","@rhinotrades2","🦏"]
  ];
  var rollCount = 0, totalDice = 0, history = [], lastColors = [], isRolling = false, blurOn = false;
  function byId(id) { return document.getElementById(id); }
  function randomInt(max) { return Math.floor(Math.random() * max); }
  function addOption(select, value, text) {
    var option = document.createElement("option");
    option.value = value; option.appendChild(document.createTextNode(text)); select.appendChild(option);
  }
  function initSelectors() {
    var count = byId("diceCount"), theme = byId("themeSelect"), i;
    for (i = 1; i <= 100; i++) { addOption(count, String(i), i + (i === 1 ? " DIE" : " DICE")); }
    count.value = "4";
    for (i = 0; i < THEMES.length; i++) { addOption(theme, String(i), THEMES[i].name); }
    theme.value = "14";
  }
  function renderStreamers() {
    var left = byId("leftStreamers"), right = byId("rightStreamers"), i, item, html;
    for (i = 0; i < STREAMERS.length; i++) {
      item = STREAMERS[i];
      html = '<div class="streamer"><span class="avatar">' + item[2] + '</span><span class="streamer-info"><span class="streamer-name">' + item[0] + ' <span class="verified">●</span></span><span class="handle">' + item[1] + '</span></span></div>';
      if (i < 8) { left.innerHTML += html; }
      else { right.innerHTML += html; }
    }
  }
  function paletteForRoll(index, mode, themeIndex) {
    var theme = THEMES[themeIndex] || THEMES[14];
    if (mode === "single") { return theme.colors[0]; }
    if (mode === "rainbow") { return COLORS[index % COLORS.length].value; }
    return COLORS[randomInt(COLORS.length)].value;
  }
  function renderDice(colors, rolling) {
    var tray = byId("diceTray"), i, html = "";
    for (i = 0; i < colors.length; i++) {
      html += '<span class="die' + (rolling ? ' rolling' : '') + '" style="background-color:' + colors[i] + '"></span>';
    }
    tray.innerHTML = html;
  }
  function updateStats() {
    byId("rollsToday").innerHTML = String(rollCount);
    byId("diceTotal").innerHTML = String(totalDice);
    byId("progressText").innerHTML = rollCount + " rolls";
    byId("progressBar").style.width = (rollCount % 101) + "%";
  }
  function updateHistory(colors) {
    var item = {number:rollCount, colors:colors.slice(0)}, i, html = "";
    history.unshift(item);
    if (history.length > 25) { history.length = 25; }
    for (i = 0; i < history.length; i++) {
      html += '<div class="history-item">#' + history[i].number + ' ';
      html += '<span class="mini-die" style="background:' + history[i].colors[0] + '"></span>';
      if (history[i].colors.length > 1) { html += '<span class="mini-die" style="background:' + history[i].colors[1] + '"></span>'; }
      if (history[i].colors.length > 2) { html += '<span class="mini-die" style="background:' + history[i].colors[2] + '"></span>'; }
      if (history[i].colors.length > 3) { html += ' +' + (history[i].colors.length - 3); }
      html += '</div>';
    }
    byId("historyList").innerHTML = html;
  }
  function rollDice() {
    if (isRolling) { return; }
    isRolling = true;
    var count = parseInt(byId("diceCount").value, 10) || 1;
    var mode = byId("diceMode").value;
    var themeIndex = parseInt(byId("themeSelect").value, 10) || 0;
    var temp = [], i, tick = 0, timer;
    for (i = 0; i < count; i++) { temp.push(COLORS[randomInt(COLORS.length)].value); }
    renderDice(temp, true);
    byId("rollButton").disabled = true;
    byId("rollButton").innerHTML = "ROLLING...";
    timer = window.setInterval(function () {
      var j;
      tick++;
      for (j = 0; j < count; j++) { temp[j] = paletteForRoll(j, mode, themeIndex); }
      renderDice(temp, true);
      if (tick >= 9) {
        window.clearInterval(timer);
        for (j = 0; j < count; j++) { temp[j] = paletteForRoll(j, mode, themeIndex); }
        lastColors = temp.slice(0);
        renderDice(lastColors, false);
        rollCount++; totalDice += count;
        byId("rollId").innerHTML = "OD-" + (new Date().getTime()).toString(36).toUpperCase() + "-" + rollCount;
        byId("scoreValue").innerHTML = "+" + count;
        updateStats(); updateHistory(lastColors);
        byId("rollButton").disabled = false;
        byId("rollButton").innerHTML = "ROLL AGAIN !";
        isRolling = false;
      }
    }, 85);
  }
  function toggleBlur() {
    blurOn = !blurOn;
    var scene = byId("scene");
    if (blurOn) { scene.className += " is-blurred"; byId("blurButton").innerHTML = "BLUR ON"; }
    else { scene.className = scene.className.replace(" is-blurred", ""); byId("blurButton").innerHTML = "BLUR OFF"; }
  }
  function setLanguage() {
    var lang = byId("languageSelect").value;
    if (lang === "fr") {
      byId("rollButton").innerHTML = "LANCER À NOUVEAU !";
      byId("downloadButton").innerHTML = "TÉLÉCHARGER L'APP";
      byId("blurButton").innerHTML = blurOn ? "FLOU ACTIVÉ" : "FLOU DÉSACTIVÉ";
    } else {
      byId("rollButton").innerHTML = "ROLL AGAIN !";
      byId("downloadButton").innerHTML = "DOWNLOAD APP";
      byId("blurButton").innerHTML = blurOn ? "BLUR ON" : "BLUR OFF";
    }
  }
  function wireEvents() {
    byId("rollButton").onclick = rollDice;
    byId("blurButton").onclick = toggleBlur;
    byId("languageSelect").onchange = setLanguage;
    byId("downloadButton").onclick = function () {
      alert("To use the Windows app offline, keep OfflineDice.hta, style.css and script.js in the same folder, then double-click OfflineDice.hta.");
    };
    byId("vipButton").onclick = function () { alert("VIP login is not connected in this offline edition."); };
    byId("tiktokButton").onclick = function () { alert("Add your TikTok URL in script.js to enable this link."); };
    byId("discordButton").onclick = function () { alert("Add your Discord invite URL in script.js to enable this link."); };
  }
  function start() {
    initSelectors(); renderStreamers(); wireEvents(); updateStats(); rollDice();
  }
  if (document.readyState === "complete" || document.readyState === "interactive") { start(); }
  else if (window.addEventListener) { window.addEventListener("load", start, false); }
  else { window.attachEvent("onload", start); }
}());
