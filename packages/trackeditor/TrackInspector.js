// target 默认指向 Componet 自定义组件
Vue.component('fishtrack-inspector', {style: 
  `:host {
  display: flex;
  flex-direction: column;
  line-height:30pt;
}`,
  // 修改组件在 inspector 的显示样式
  template: `
  Track Name <ui-input v-value="target.lineKey.value"></ui-input>  <br>
  <v-color-picker canvas-height="80" width="259" v-model="target.lineColor.value"></v-color-picker>
  {{Init(target.lineKey.value)}}
  <div v-for="indexLine in target.wayPoints.value.length" :key="indexLine">
    Node{{indexLine}} &nbsp;&nbsp; 
    X <ui-num-input @confirm="onChange_PosValue" placeholder="width" v-value="wayPoints[indexLine].x"
    class="self-center"></ui-num-input>
    Y <ui-num-input @confirm="onChange_PosValue" placeholder="width" v-value="wayPoints[indexLine].y"
    class="self-center"></ui-num-input>
    <br>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <ui-button @confirm="onAddElement(indexLine)">Add Node</ui-button> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <ui-button @confirm="onRemoveElement(indexLine)">Remove Node</ui-button>
  </div>>
  <div class="MovePos">
  Move Track
  X <ui-num-input placeholder="width" v-value="movePosVec.x" class="self-center"></ui-num-input>
  Y <ui-num-input placeholder="width" v-value="movePosVec.y" class="self-center"></ui-num-input>
  <br>
  <ui-button @confirm="onMovePos">Move</ui-button>
  </div>
  `,
  props: {
    target:  // 目標物件
    {
      twoWay: true,
      type: Object,
    },
    wayPoints:  // 座標陣列
    {
        default:[],
        type: [cc.Vec2],
        serializable: true, 
    },
    isInited: // 初始化標籤
    {
      type: Boolean ,
      default: false,
      serializable: true, 
    },
    targetObj: // 目標元件
    {
      type: cc.Node,
    },
    lineKey: // 線段索引
    {
      type:String,
      default: "",
    },
    movePosVec: // 平移座標
    {
      type:cc.Vec2,
      default: [0,0],
    }
  },
    methods:
    {
      // cc.log("xxx"); Log方法
        T: Editor.T,
        // 初始化
        Init(key)
        {
          if(this.isInited == false)
          {
            // 數值初始化
            this.wayPoints = [];
            this.lineKey = key;

            // 尋找場景內物件
            let id = this.target.uuid.value;
            this.targetObj = cc.engine.getInstanceById(this.target.uuid.value); 
  
            // 尋找物件內對應元件
            for(let i in this.targetObj.getComponents("TrackComponent"))
            {
              if(this.targetObj.getComponents("TrackComponent")[i].lineKey == this.lineKey)
              {
                // 獲取座標陣列
                let wps = this.targetObj.getComponents("TrackComponent")[i].wayPoints;
                for(let k in wps)
                {
                  this.wayPoints.push(wps[k]);
                }
              }
            }
            
            this.isInited = true;
          }
        },
        // 修改座標事件
        onChange_PosValue()
        {
          // 尋找物件內對應元件
          for(let i in this.targetObj.getComponents("TrackComponent"))
          {
            if(this.targetObj.getComponents("TrackComponent")[i].lineKey == this.lineKey)
            {
              this.targetObj.getComponents("TrackComponent")[i].onChange_PosValue(this.wayPoints);
            }
          }
        },
        // 增加座標事件
        onAddElement(index)
        {
          this.wayPoints.splice(index+1,0,new cc.Vec2(0,0));
          this.onChange_PosValue();
        },
        // 移除座標事件
        onRemoveElement(index)
        {
          this.wayPoints.splice(index,1);
          this.onChange_PosValue();
        },
        // 平移座標事件
        onMovePos()
        {
          for(let k in this.wayPoints)
          {
            if(this.movePosVec.x)
            {
              this.wayPoints[k].x+=this.movePosVec.x;
            }
            if(this.movePosVec.y)
            {
              this.wayPoints[k].y+=this.movePosVec.y;
            }
          }
          this.onChange_PosValue();
        }
    },
}
);