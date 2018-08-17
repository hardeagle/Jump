const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class RankingView extends cc.Component {

    @property(cc.Node) //显示微信子域排行
    subCanvas = null;

    @property(cc.Node) //结束界面
    node_end = null;
    @property(cc.Node) //好友列表和 群列表对应按钮
    node_list = null;
    @property(cc.Node) //查看群排行按钮
    btn_qun = null;

    onLoad() {
        this.showPanel("end");
    }

    start() {
        //微信子域相关
        this.initSubCanvas();
        this.schedule(this.updataSubCanvas, 0.5);

        this.subPostMessage("submit");
        this.subPostMessage("end");
    }

    //end friend group 三个对应的层级
    showPanel(panelName) {
        if (panelName == "end") {
            this.node_end.active = true;
            this.node_list.active = false;
            this.node_end.getChildByName("now_Label").getComponent(cc.Label).string = ("得分:" + cc.dataMgr.userData.countJump);
            this.node_end.getChildByName("prop").active = false;
            //this.node_end.getChildByName("prop").getChildByName("prop_Label").getComponent(cc.Label).string = cc.dataMgr.userData.propGreenNum;
        } else if (panelName == "friend") {
            this.node_end.active = false;
            this.node_list.active = true;
            this.btn_qun.active = true;
        } else if (panelName == "group") {
            this.node_end.active = false;
            this.node_list.active = true;
            this.btn_qun.active = false;
        }
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            cc.audioMgr.playEffect("btn_click");
            let btnN = event.target.name;
            if (btnN == "anniu_zhuyie") {
                cc.director.loadScene("game");
            } else if (btnN == "kuangti_tongyong01") {
                cc.director.loadScene("game");
            } else if (btnN == "ziti_chakanhaoyou") {
                this.subPostMessage("friend");
            } else if (btnN == "ziti_chakanqun") {
                this.shareGroup();
            } else if (btnN == "anniu_backEnd") {
                this.subPostMessage("end");
            }
            else if (btnN == "anniu_weixin") {
                this.shareFriend();
            }
        }
    }

    //------ 微信子域游戏内所有操作 ------

    //初始化子域信息
    initSubCanvas() {
        this.tex = new cc.Texture2D();
        if (CC_WECHATGAME) {
            console.log("-- WECHAT End.js initSubCanvas --");
            window.sharedCanvas.width = 720;
            window.sharedCanvas.height = 1280;
        }
    }

    updataSubCanvas() {
        if (CC_WECHATGAME) {
            console.log("-- WECHAT End.js updataSubCanvas --");
            this.tex.initWithElement(window.sharedCanvas);
            this.tex.handleLoadedTexture();
            this.subCanvas.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(this.tex);
        }
    }

    //这里type: submit(提交个人数据)、end(结束界面)、friend(好友排行)
    subPostMessage(type) {
        if (CC_WECHATGAME) {
            console.log("-- WECHAT End.js subPostMessage --" + type);
            if (type == "submit") {
                window.wx.postMessage({
                    messageType: 2,
                    MAIN_MENU_NUM: "user_best_score",
                    myScore: cc.dataMgr.userData.countJump
                });
            } else if (type == "end") {
                window.wx.postMessage({
                    messageType: 3,
                    MAIN_MENU_NUM: "user_best_score",
                    myScore: cc.dataMgr.userData.countJump
                });
                this.showPanel("end")
            } else if (type == "friend") {
                window.wx.postMessage({
                    messageType: 1,
                    MAIN_MENU_NUM: "user_best_score",
                    myScore: cc.dataMgr.userData.countJump
                });
                this.showPanel("friend");
            }
        }
    }

    //获取群排行
    shareGroup() {
        let self = this;
        if (CC_WECHATGAME) {
            window.wx.shareAppMessage({
                title: "我再这里，等你来超越。--境之边缘",
                imageUrl: "https://bpw.blyule.com/res/raw-assets/Texture/shareImage0.a52e5.jpg",
                success: (res) => {
                    console.log("-- shareGroup success --");
                    console.log(res);
                    if (res.shareTickets != undefined && res.shareTickets.length > 0) {
                        window.wx.postMessage({
                            messageType: 5,
                            MAIN_MENU_NUM: "user_best_score",
                            shareTicket: res.shareTickets[0]
                        });
                        self.showPanel("group");
                    }
                }
            });
        } else {
            console.log("-- Not is wechatGame --");
        }
    }

    //分享给好友
    shareFriend() {
        if (CC_WECHATGAME) {
            window.wx.shareAppMessage({
                title: "我再这里，等你来。--境之边缘",
                imageUrl: "https://bpw.blyule.com/res/raw-assets/Texture/shareImage0.a52e5.jpg",
                success: (res) => {
                    cc.dataMgr.shareSuccess();
                }
            });
        } else {
            console.log("-- Not is wechatGame --");
        }
    }
}