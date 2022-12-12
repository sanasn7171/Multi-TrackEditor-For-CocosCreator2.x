fs = require('fs');

module.exports = 
{
  load () 
  {
  },

  unload () 
  {
  },

  'GetJsonInfo' : function(e,jsonObjUUID)
  {
    // 透過UUID讀取對象Json檔案
    cc.assetManager.loadAny({'uuid': jsonObjUUID,type: cc.JsonAsset, bundle: 'resources'},function(err,jsonAsset)
      {
        if(err)
        {
          Editor.log('error : '+err);
          return;
        }

        // 計算Json行數
        let lineAmount = 0;
        let jsonKeys = [];
        for(let key in jsonAsset.json)
        {
          lineAmount+=1;
          jsonKeys.push(key);
        }

        // 返回結果
        if(e.reply)
        {
          e.reply(null,jsonAsset.json,lineAmount,jsonKeys);
          return;
        } 
      } // cc.assetManager.loadAny function
    ); // cc.assetManager.loadAny
  },
  'DrawAllhPath' : function(e,jsonObjUUID)
  {
    let jsonPath = Editor.assetdb.remote.uuidToFspath(jsonObjUUID); // 將物件UUID轉換為路徑

    // 透過UUID讀取對象Json檔案
    cc.assetManager.loadAny({'uuid': jsonObjUUID,type: cc.JsonAsset, bundle: 'resources'},function(err,jsonAsset)
      {
        if(err)
        {
          Editor.log('error : '+err);
          return;
        }

        let nodeLineParent = cc.find("Tracks");
        if(nodeLineParent == null)
        {
          // 建立魚線親節點
          let nodeLineParentObj = new cc.Node("Tracks");
          nodeLineParent = cc.director.getScene().addChild(nodeLineParentObj);
        }
        else
        {
          nodeLineParent.destroy();

          // 建立魚線親節點
          let nodeLineParentObj = new cc.Node("Tracks");
          nodeLineParent = cc.director.getScene().addChild(nodeLineParentObj);
        }

        // 建立魚線子節點
        for(let key in jsonAsset.json)
        {
          let nodeLineChildObj = new cc.Node(key.toString());
          let trackLine =cc.find("Tracks").addComponent("TrackComponent");
          trackLine.Setup(jsonAsset.json[key], key);
        }
      } // cc.assetManager.loadAny function
    ); // cc.assetManager.loadAny
  },
  // 清除場景內魚線元件
  'ClearTrack' : function(e,indexJson,indexLine)
  {
    cc.director.getScene().walk
    (
      // 遍歷場景內所有節點
      function (t) 
      {
        if(t.name == "Tracks")
        {
          t.destroy(); // 刪除魚線物件
        }
      }, 
      function (t) //在「每個」子節點訪問完後回傳
      {
      }
    );
  },
  // 啟用魚線元件的可視性
  'ActiveTrack' : function(e,indexJson,isActived)
  {
    cc.find("Tracks").getComponents("TrackComponent")[indexJson].ActiveTrack(isActived);
  },
  // 儲存Json數值
  'SaveValue' : function(e,jsonObjUUID)
  {
    tracks = cc.find("Tracks").getComponents("TrackComponent");
    var jsonPath = Editor.assetdb.remote.uuidToFspath(jsonObjUUID); // 將物件UUID轉換為路徑

    // 透過UUID讀取對象Json檔案
    cc.assetManager.loadAny({'uuid': jsonObjUUID,type: cc.JsonAsset, bundle: 'resources'},function(err,jsonAsset)
    {
      if(err) // 錯誤返回
      {
        Editor.log('error : '+err);
        return;
      }

      // 獲取Json的Keys
      let jsonKeys = [];
      for(let key in jsonAsset.json)
      {
        jsonKeys.push(key);
      }

      // 將變更後的結果存為新的陣列
      for(let i =0;i<tracks.length;i++)
      {
        jsonAsset.json[jsonKeys[i]] = [];
        for(let i2=0;i2<tracks[i].wayPoints.length;i2++)
        {
          jsonAsset.json[jsonKeys[i]][i2] = [tracks[i].wayPoints[i2].x,tracks[i].wayPoints[i2].y];
        }
      }
  
      let newJsonArray = {};
      for(let key in jsonAsset.json)
      {
        newJsonArray[key] = jsonAsset.json[key];
      }
  
      // 轉換為JSON字串
      let modifiedJson = JSON.stringify(newJsonArray,null,0);
  
      // 寫入JSON檔案
      fs.writeFile(jsonPath,modifiedJson,(err)=>
      {
        if(err)
        {
          Editor.log('error : '+err);
        }
      });
  
      // 返回結果
      if(e.reply)
      {
        e.reply(null);
        return;
      } 
    } // cc.assetManager.loadAny function
    );// cc.assetManager.loadAny
  },
  'SetJsonInfo' : function(e,jsonObjUUID, indexJson, indexLine, changedLine)
  {
    //var jsonUrl = Editor.assetdb.remote.uuidToUrl(jsonObjUUID); // 將物件UUID轉換為URL
    var jsonPath = Editor.assetdb.remote.uuidToFspath(jsonObjUUID); // 將物件UUID轉換為路徑

    // 透過UUID讀取對象Json檔案
    cc.assetManager.loadAny({'uuid': jsonObjUUID,type: cc.JsonAsset, bundle: 'resources'},function(err,jsonAsset)
      {
        if(err)
        {
          Editor.log('error : '+err);
          return;
        }

        // 將變更後的結果存為新的陣列
        jsonAsset.json["line" + indexJson][indexLine] = changedLine;
        let newJsonArray = {};
        for(let key in jsonAsset.json)
        {
          newJsonArray[key] = jsonAsset.json[key];
        }

        // 轉換為JSON字串
        let modifiedJson = JSON.stringify(newJsonArray,null,0);

        // 寫入JSON檔案
        fs.writeFile(jsonPath,modifiedJson,(err)=>
        {
          if(err)
          {
            Editor.log('error : '+err);
          }
        }
        );

        // 返回結果
        if(e.reply)
        {
          e.reply(null);
          return;
        } 
      } // cc.assetManager.loadAny function
    ); // cc.assetManager.loadAny
  },
  // 新建Json檔案
  'CreateJson' : function(e,jsonName)
  {
  },
};
