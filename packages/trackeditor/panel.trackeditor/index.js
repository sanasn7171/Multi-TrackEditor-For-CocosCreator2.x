var fs = require('fs');
var path = require('fire-path');
const TrackEditorWindow = require('../TrackEditorWindow');

Editor.Panel.extend
(
  {
    style: fs.readFileSync(Editor.url('packages://trackeditor/panel.trackeditor/index.css'), 'utf-8'),
    template: fs.readFileSync(Editor.url('packages://trackeditor/panel.trackeditor/index.html'), 'utf-8'),

    $: {},
    
    ready()
    {
      window.creatyorHelper = new window.Vue
      (
        {
          el: this.shadowRoot,
          create()
          {
            this.isJsonSetuped = false;
            this.activedTracks = [];
            this.jsonObject= null;
            this.lineList= []; // [line0:[[xxx,xxx],[yyy,yyy],[zzz,zzz]],line1:[xxx,xxx],...]
            this.lineAmount = 0;
            this.jsonKeys = [];
            this.newJsonPath = '';
          },
          data:
          {
            isJsonSetuped: false,
            activedTracks: [],
            jsonObject: null,
            lineList: [],
            lineAmount: 0,
            jsonKeys: [],
            newJsonPath: '',
          },
          computed:
          {
            getJsonLangth:function()
            {
              return this.lineAmount;
            }
          },
          methods:
          {
            // 獲取魚線節點數量
            getLineLangth(index)
            {
              return this.lineList['line'+index].length;
            },
            // 魚線物件取消事件
            onCancel_Track()
            {
              this.isJsonSetuped = false;
              this.activedTracks = [];
              this.jsonObject= null;
              this.lineList= [];
              this.lineAmount = 0;
              this.jsonKeys = [];
            },
            // 確定按鈕點擊事件
            onFishLineSetup()
            {
              this.isJsonSetuped = true;
              // 呼叫場景Script獲取Json內容
              Editor.Scene.callSceneScript
              ('trackeditor', 'DrawAllhPath', this.jsonObject,(err)=>
                { 
                }
              );
            },
            // 追加路線按鈕點擊事件
            onAddTrack()
            {
              Editor.Scene.callSceneScript
              ('trackeditor', 'AddTrack',(err)=>
                { 
                }
              );
              this.activedTracks.push(false);
              this.jsonKeys.push('newTrack');
              this.lineAmount += 1;
            },
            // 刪除路線按鈕點擊事件
            onRemoveTrack(i)
            {
              Editor.Scene.callSceneScript
              ('trackeditor', 'RemoveTrack', i,(err)=>
                { 
                }
              );
              this.activedTracks.splice(i,1);
              this.jsonKeys.splice(i,1);
              this.lineAmount -= 1;
            },
            // Json物件修改事件
            onChange_JsonObject()
            {
              // 初始化
              this.isJsonSetuped = false;
              this.activedTracks = [];
              this.jsonObject= null;
              this.lineList= [];
              this.lineAmount = 0;
              
              Editor.Scene.callSceneScript // 清除舊魚線
              ('trackeditor', 'ClearTrack',(err)=>
                { 
                }
              );

              this.jsonObject = this.$els.json_fishline.value;// 獲取Html內Vue物件參數 
              if(this.jsonObject == null)
              {
                return;
              }

              // 呼叫場景Script獲取Json內容
              Editor.Scene.callSceneScript
              ('trackeditor', 'GetJsonInfo', this.jsonObject,(err, rawJson, jsonLangth,jsonKeys)=>
                { 
                  this.lineList = rawJson;
                  this.lineAmount = jsonLangth;
                  this.jsonKeys = jsonKeys;
                }
              );
            },
            // Json物件取消事件
            onCancel_JsonObject()
            {
              this.isJsonExist = false;
              this.isJsonSetuped = false;
            },
            onChange_TrackActived(i)
            {
              // 呼叫場景Script修改Json內容
              Editor.Scene.callSceneScript
              ('trackeditor', 'ActiveTrack', i,this.activedTracks[i],(err)=>
                { 
                }
              );
            },
            // Json內容寫入事件
            onFishLineSave()
            {
              // 呼叫場景Script修改Json內容
              Editor.Scene.callSceneScript
              ('trackeditor', 'SaveValue', this.jsonObject,(err)=>
                { 
                }
              );
            },
            // 新建Json事件
            onCreateJson()
            {
              // 呼叫場景Script修改Json內容
              Editor.Scene.callSceneScript
              ('trackeditor', 'CreateJson',this.newJsonPath,(err)=>
                { 
                }
              );
            },
            // 魚線座標修改事件
            onChange_LinePos(indexJson,indexLine)
            {
              var changedLine = this.lineList[this.jsonKeys[indexJson]][indexLine];

              // 呼叫場景Script修改Json內容
              Editor.Scene.callSceneScript
              ('trackeditor', 'SetJsonInfo', this.jsonObject,indexJson,indexLine, changedLine,(err)=>
                { 
                }
              );
            },
          } // methods
        }
      ) // Vue
    }, // ready
    close() // Panel關閉回調函數
    {
      Editor.Scene.callSceneScript
      ('trackeditor', 'ClearTrack',(err)=>
        { 
        }
      );
    }, // close

    MultiTrackEdit()
    {
      var track = this.$els.node_track.value; 

      if(track ==null) // 偵測魚線是否存在
      {
        return;
      }
    }
  }
)