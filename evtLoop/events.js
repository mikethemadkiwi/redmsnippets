let NISS = false;
let CGTS = false;
let MAPSTART = false;
let PSPAWN = false;
let nisstimer = setTick(async() => {
    if( NetworkIsSessionStarted() ){
        NISS = true;
        emitNet('evtLoop:NISS', NISS);
        clearTick(nisstimer);
    }
})
on('onClientMapStart', ()=>{
    MAPSTART = true;
    emitNet('evtLoop:MAPSTART', MAPSTART);
})
on('onClientGameTypeStart', ()=>{
    CGTS = true;
    emitNet('evtLoop:CGTS', CGTS);
})
on('playerSpawned', ()=>{
    PSPAWN = true;
    emitNet('evtLoop:PSPAWN', PSPAWN);
});
class popup {    
    DisplayNotification(title, subTitle, iconDict, icon, duration){
        return new Promise((resolve, reject)=>{
            const struct1 = new DataView(new ArrayBuffer(48));
            struct1.setInt32(0, duration, true);
            struct1.setInt32(8, 0, true);
            struct1.setInt32(16, 0, true);
            const string1 = CreateVarString(10, "LITERAL_STRING", title);
            const string2 = CreateVarString(10, "LITERAL_STRING", subTitle);
            const struct2 = new DataView(new ArrayBuffer(72));
            struct2.setBigInt64(8, BigInt(string1), true);
            struct2.setBigInt64(16, BigInt(string2), true);
            struct2.setBigInt64(32, BigInt(GetHashKey(iconDict)), true);
            struct2.setBigInt64(40, BigInt(GetHashKey(icon)), true);
            struct2.setInt32(48, 0, true);
            struct2.setInt32(56, 1, true);
            struct2.setInt32(64, 0, true);
            setTimeout(function(){Citizen.invokeNative("0x26E87218390E6729", struct1, struct2, 1, 1);}, 250);
            resolve(true)
        })
    }
}
let GAMETICK = setTick(async() => {
    if (PSPAWN==true){
        /////////////////////////////////

        let AIEvents = GetNumberOfEvents(0)
		// local NetworkEventQueue = GetNumberOfEvents(1)
		// local ErrorEventQueue = GetNumberOfEvents(4)
        if(AIEvents>0){
            for (let eventkey = 0; eventkey < AIEvents; eventkey++) {
                const element = GetEventAtIndex(0, eventkey);
                let buffer = new ArrayBuffer(256);
                let view = new DataView(buffer);
                switch(element) {
                    case 1327216456: // whistles
                    // whistle["0"] // Ped Whistling
                    // whistle["2"] // Whistle Type
                        Citizen.invokeNative("0x57EC5FA4D4D6AFCA", 0, eventkey, view, 2, Citizen.returnResultAnyway());
                        let whistle = new Int32Array(buffer);
                        if(whistle["0"]==PlayerPedId()){ // if it is Player whistling
                            if(whistle["2"]==1704957293){
                                emitNet('evtLoop:shortwhistle', whistle)
                                emit('evtLoop:shortwhistle', whistle)    
                            }
                            if(whistle["2"]==869278708){
                                emitNet('evtLoop:longwhistle', whistle)
                                emit('evtLoop:longwhistle', whistle)                        
                            }
                        }
                    break;
                    case 1352063587: // Open/Close ( Chests/Dressers/Closets/Drawers etc)
                        Citizen.invokeNative("0x57EC5FA4D4D6AFCA", 0, eventkey, view, 4, Citizen.returnResultAnyway());
                        let ransack = new Int32Array(buffer);
                        // ransack["0"] // ped interacting
                        // ransack["2"] // container entity
                        // ransack["4"] // ransack scenario attached to the container entity
                        // ransack["6"] // 0 open 1 closed
                        if(ransack["0"]==PlayerPedId()){
                            if(ransack["6"]==0){
                                emitNet('evtLoop:opencontainer', ransack)
                            }
                            if(ransack["6"]==1){
                                emitNet('evtLoop:closecontainer', ransack)
                            }
                        }
                        else{
                            console.log('saw ransack from:', ransack["0"])
                        }
                    break;
                    case -1246119244: // Animal Interactions (feed, pet, brush)
                        Citizen.invokeNative("0x57EC5FA4D4D6AFCA", 0, eventkey, view, 3, Citizen.returnResultAnyway());
                        let animalinteract = new Int32Array(buffer);
                        // PED INTERACTING
                        if(animalinteract["0"]==PlayerPedId()){
                            // animalinteract["0"] // who is interacting
                            // animalinteract["2"] // ped being interacted with
                            // animalinteract["3"] // ??? 0,1,8  = tied to animations or scenario?
                            // animalinteract["4"]    // interaction type    
                            if(animalinteract["4"]==891866754){
                                // console.log('animal interaction start')
                            }
                            else if(animalinteract["4"]==25367022){
                                // console.log('animal interaction end')
                            }
                            else if(animalinteract["4"]==637277148){
                                console.log('respectchange?', JSON.stringify(animalinteract))
                            }                        
                            else if(animalinteract["4"]==391681984){ // pet horse?
                                let _p = new popup;//title, subTitle, iconDict, icon, duration
                                _p.DisplayNotification('Animal Interaction', 'Pet', 'HUD_TOASTS', 'toast_horse_bond', 2500)
                                emitNet('evtLoop:pethorse', animalinteract)
                            }
                            else if(animalinteract["4"]==809336218){ // loot horse?
                                // console.log('Pedloot', animalinteract)
                                let _p = new popup;
                                _p.DisplayNotification('Animal Interaction', 'Loot', 'HUD_TOASTS', 'toast_horse_bond', 2500)
                                emitNet('evtLoop:loothorse', animalinteract)
                            }
                            else if(animalinteract["4"]==-761930189){ // calm horse begin?
                                // console.log('pedcalming', animalinteract)
                                let _p = new popup;
                                _p.DisplayNotification('Animal Interaction', 'Calmed When Angry', 'HUD_TOASTS', 'toast_horse_bond', 2500)
                            }
                            else if(animalinteract["4"]==-729574460){ // calmed? horse, almost happy?
                                // console.log('pedcalmed', animalinteract)
                                let _p = new popup;
                                _p.DisplayNotification('Animal Interaction', 'Calmed when Spooked', 'HUD_TOASTS', 'toast_horse_bond', 2500)
                            }
                            else{
                                console.log('pedinteract', animalinteract)
                                emitNet('evtLoop:animalinteract', animalinteract)
                            }
                        }
                    break;
                    case -687266558: // Ped Carry event
                        Citizen.invokeNative("0x57EC5FA4D4D6AFCA", 0, eventkey, view, 4, Citizen.returnResultAnyway());
                        let pedcarry = new Int32Array(buffer);
                        // pedcarry["0"] // Carrier
                        // pedcarry["1"] // 
                        // pedcarry["2"] // Carried Obj/Ped
                        if(pedcarry["0"]==PlayerPedId()){
                            emitNet('evtLoop:pedcarry', pedcarry["2"], pedcarry)
                            console.log('pedcarry', pedcarry["2"], pedcarry)
                        }
                        else{
                            console.log('saw pedcarry', pedcarry)
                        }
                    break;
                    case 1376140891: // Ped Finishes Skinning or Looting a Ped
                        Citizen.invokeNative("0x57EC5FA4D4D6AFCA", 0, eventkey, view, 3, Citizen.returnResultAnyway());
                        let gatheringfromped = new Int32Array(buffer);
                        // gatheringfromped["0"] // Ped Gathering
                        // gatheringfromped["2"] // Ped Gathered From
                        // gatheringfromped["4"] // boolean (?)
                        emitNet('evtLoop:gatheringfromped', gatheringfromped)
                    break;
                    case 1208357138: // Interactable Ped Event
                        Citizen.invokeNative("0x57EC5FA4D4D6AFCA", 0, eventkey, view, 5, Citizen.returnResultAnyway());
                        let lootableped = new Int32Array(buffer);
                        // gatheringfromped["0"] // lootable Ped
                        // gatheringfromped["1"] // interaction type
                        // gatheringfromped["2"] // Ped Interacting
                        // emitNet('evtLoop:gatheringfromped', gatheringfromped)
                        if(lootableped["2"]==PlayerPedId()){
                                console.log('carryable:', lootableped)
                        }
                    break;                
                    case -1509407906: // item is detected in range
                        Citizen.invokeNative("0x57EC5FA4D4D6AFCA", 0, eventkey, view, 2, Citizen.returnResultAnyway());
                        let inrange = new Int32Array(buffer);//["0":ped]
                        console.log('Player inrange of:', inrange)
                        // let _p = new popup;
                        // _p.DisplayNotification(`Player inrange of: ${inrange}`, 1500)
                        // gatheringfromped["2"] // Ped Gathered From
                        // gatheringfromped["4"] // boolean (pickup/putdown)
                        // emitNet('evtLoop:gatheringfromped', gatheringfromped)
                    break;
                    default:
                        // console.log('UNKNOWN', element)
                } 
            }
        }

        /////////////////////////////////

    }
})
exports('EventDataView', (eventGroup, index, argStructSize) => {
    let buffer = new ArrayBuffer(256);
    let view = new DataView(buffer);
    Citizen.invokeNative("0x57EC5FA4D4D6AFCA", eventGroup, index, view, argStructSize, Citizen.returnResultAnyway());
    let out = new Int32Array(buffer);
    return out;
});