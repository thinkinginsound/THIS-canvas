/*
Function to switch user groups
*/

/*
~~~OldCode~~~
    if(clockCounter%20==1){
      // Check every half minute who are the users with the most herding behaviour per group. Switch these users
      let clockOffset = clockCounter-60 + 1;
      let rawherdingdata = dbHandler.getUserdataByClock(clockOffset);
      let herdingdata = new Array(global.maxgroups).fill(0).map(() => new Object());
      let groupherdingdata = new Array(global.maxgroups).fill(0);
      let hasHerded = 0;
      for(let entry of rawherdingdata){
        if(entry.sessionkey.indexOf("npc_")!=-1)continue;
        if(herdingdata[entry.groupid][entry.sessionkey] === undefined){
          herdingdata[entry.groupid][entry.sessionkey] = 0;
        }
        herdingdata[entry.groupid][entry.sessionkey] += entry.isherding;
        groupherdingdata[entry.groupid] += entry.isherding;
        hasHerded |= entry.isherding;
      }
      if(hasHerded){
        let maxherdingindexes = tools.findIndicesOfMax(groupherdingdata, 2);
        let herderid1 = tools.findKeysOfMax(herdingdata[maxherdingindexes[0]], 1)[0];
        let herderid2 = tools.findKeysOfMax(herdingdata[maxherdingindexes[1]], 1)[0];
        let herderid1_index = users[maxherdingindexes[0]].indexOf(herderid1);
        let herderid2_index = users[maxherdingindexes[1]].indexOf(herderid2);
        dbHandler.updateSession(herderid1, {groupid:maxherdingindexes[1]});
        dbHandler.updateSession(herderid2, {groupid:maxherdingindexes[0]});
        global.herdupdate = {};
        global.herdupdate[herderid1] = {groupid:maxherdingindexes[1], userindex:herderid2_index};
        global.herdupdate[herderid2] = {groupid:maxherdingindexes[0], userindex:herderid1_index};
        io.sockets.emit("groupupdate",global.herdupdate);
        logger.verbose("herders", {herderid1:herderid1, herderid2:herderid2});
        logger.verbose("maxherdingindexes", {groupherdingdata:groupherdingdata, hasHerded:hasHerded, maxherdingindexes:maxherdingindexes});
      } else {
        logger.verbose("herdupdate send", {message:"no update"});
      }
      logger.verbose("herdingdata", herdingdata);
    }
*/