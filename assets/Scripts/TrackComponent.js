cc.Class({
    extends: cc.Component,
     
    editor:{
        inspector: 'packages://trackeditor/TrackInspector.js',
    },
    properties: {
        lineKey:'',
        lineColor:
        {
            default:cc.color(222,222,222,191),
            type: cc.color
        },
        wayPoints:
        {
            default:[],
            type: [cc.Vec2],
            serializable: true, 
        },
        posX: function(index) 
        {
            return this.wayPoints[index].x;
        },
        isActivedTrack: false,
        radius: 25,
    },
    // 輸入座標陣列
    Setup(line,lineKey)
    {
        this.lineKey = lineKey;
        for(let key in line)
        {
            this.wayPoints.push(new cc.Vec2(line[key][0],line[key][1]));
        }
    },
    // 魚線可視性
    ActiveTrack(a)
    {
        this.isActivedTrack = a;
    },
    // 座標修改事件
    onChange_PosValue(newWPs)
    {
        this.wayPoints = newWPs;
    },
});
