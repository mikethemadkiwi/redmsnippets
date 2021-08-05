const NISS = [];
const MAPSTART = [];
const CGTS = [];
const PSPAWN = [];
// connection events
onNet('evtLoop:NISS', async ()=>{
    NISS.push(global.source)
    console.log('NISS', global.source, GetPlayerName(global.source))
});
onNet('evtLoop:MAPSTART', async ()=>{
    MAPSTART.push(global.source)
    console.log('MAPSTART', global.source, GetPlayerName(global.source))
});
onNet('evtLoop:CGTS', async ()=>{
    CGTS.push(global.source)
    console.log('CGTS', global.source, GetPlayerName(global.source))
});
onNet('evtLoop:PSPAWN', async ()=>{
    PSPAWN.push(global.source)
    console.log('PSPAWN', global.source, GetPlayerName(global.source))
});
on('onResourceStart', async (resourceName)=>{
    if (this.resourceName != resourceName) { return; }
    else { 
        console.log(`Started EvtLoop as: [${GetCurrentResourceName()}]`)
        // should i be adding existing players to the list NOW?
        // if they are already connected i wont see them added...
    }
});
on('onResourceStop', async (resourceName)=>{
    if (this.resourceName != resourceName) { return; }
    else {//echo that i stopped.

    }
});
on('playerDropped', async (reason)=>{
    let dPlayer = global.source;
    let NISS_Index = NISS.map(function(id) { return id; }).indexOf(dPlayer); 
    let MAPSTART_Index = MAPSTART.map(function(id) { return id; }).indexOf(dPlayer); 
    let CGTS_Index = CGTS.map(function(id) { return id; }).indexOf(dPlayer); 
    let PSPAWN_Index = PSPAWN.map(function(id) { return id; }).indexOf(dPlayer); 
    NISS.splice(NISS_Index, 1);  
    MAPSTART.splice(MAPSTART_Index, 1);  
    CGTS.splice(CGTS_Index, 1);  
    PSPAWN.splice(PSPAWN_Index, 1); 
});
// game events
onNet("evtLoop:shortwhistle",(shortwhistle) => {
    let src = source;
    let stringData = JSON.stringify(shortwhistle)
    emitNet("evtLoop:playerSWhistle", shortwhistle)
    console.log('shortwhistle', src, stringData)
});
onNet("evtLoop:longwhistle",(longwhistle) => {
    let src = source;
    let stringData = JSON.stringify(longwhistle)
    emitNet("evtLoop:playerLWhistle", longwhistle)
    console.log('longwhistle', src, stringData)
});
onNet("evtLoop:opencontainer",(opencontainer) => {
    let src = source;
    let container = opencontainer[2];
    let contentsid = opencontainer[4];
    let stringData = JSON.stringify(opencontainer)
    console.log('opencontainer', src, container, contentsid, stringData)
});
onNet("evtLoop:closecontainer",(closecontainer) => {
    let src = source;
    let container = closecontainer[2];
    let contentsid = closecontainer[4];
    let stringData = JSON.stringify(closecontainer)
    console.log('closecontainer', src, container, contentsid, stringData)
});
onNet("evtLoop:animalinteract",(animalinteract) => {
    let src = source;
    let stringData = JSON.stringify(animalinteract)
    console.log('animalinteract', src, stringData)
});
onNet("evtLoop:pedcarry",(pedcarry) => {
    let src = source;
    let stringData = JSON.stringify(pedcarry)
    console.log('pedcarry', src, stringData)
});
onNet("evtLoop:gatheringfromped",(gatheringfromped) => {
    let src = source;
    let stringData = JSON.stringify(gatheringfromped)
    console.log('gatheringfromped', src, stringData)
});