# ロボカップ3D秋キャンプ講習会

### https://koyubistrong.github.io/ にアクセス(ここのページに行くため）

## 事前準備

### ファイルの作成

「RCOpenFUTK/src/Agent」に「AgentTest」を作成する．
「AgentTest」の中にAgentTest.hppとAgentTest.cppを作成する．

### クラスの作成

「AgentTest.hpp」と「AgentTest.cpp」に以下のリンクからコピーして貼り付ける．

[AgentTest.hpp](https://github.com/koyubistrong/koyubistrong.github.io/blob/master/AgentTest.hpp)<br>
[AgentTest.cpp](https://github.com/koyubistrong/koyubistrong.github.io/blob/master/AgentTest.cpp)

「RCOpenFUTK/src」に移動して以下コマンドを実行する．

$./AutoMakeFileAM

これは自動的に「src」の配下にあるファイルソースコードを自動的に「Makefile.am」に追加する．<br>
新しくファイル追加した場合や削除した場合はこれを実行するか直接「Makefile.am」を編集する必要ある．<br>
「Makefile.am」を開いて

Agent/AgentTest/AgentTest.hpp<br>
Agent/AgentTest/AgentTest.cpp

があることを確認する．<br>

### main関数の変更

「RCOpenFUTK/src/Main/main.cpp」を以下の様に書き換える．

    Agent* agent;
    srand((unsigned int)time(NULL));
    //agent = new AgentSample(argc, argv);
    agent = new AgentTest(argc, argv);
    agent->Run();

上のほうに
    
    #include "AgentTest.hpp"
	
も追加する．

## 関節を動かす

### コードで直接間接を動かす

Think関数の中に「MoveHeadByCode」関数を呼び出すようにする．<br>
「MoveHeadByCode」関数を以下のコードを追加し，コンパイルして「ticktack」を実行してみよう．

    JointController& jc = SJointController::GetInstance();
    jc.SettingRelativeSpeed(HJ_HJ1, 120.0, 0.05);

SettingRelativeSpeed関数は目標角度と現在の角度大きければ早くなる．<br>
逆に小さければ遅くなる．<br>
引数を説明する．

　第一引数は回転させる関節を指定する．<br>
　第二引数はどこまで回転させるか指定する．<br>
　第三引数は早さを指定する．（負の数は不可能）<br>

コードはこのように示している．

　「HJ_HJ1」は頭の横方向の回転のID<br>
　「120.0」は120度まで回転させる<br>
　「0.05」は早さを指定している<br>

関節のIDに関しては「const.hpp」に書いてあるので参照すること．

### 課題 1

「cycle」変数を使って繰り返し左右にロボットの頭を動かせるようにせよ．

[ヒント]<br>
cycleは1ずつ進め．<br>
cycleが0-99の時は右に，cycleが100-199時は左に，200になったらcycleを0にリセットする．<br>
というような感じで書く．

-想定解-

    JointController& jc = SJointController::GetInstance();
    cycle++;
    if(cycle < 100)
    {
        jc.SettingRelativeSpeed(HJ_HJ1, 120.0, 0.05);
    }
    else if(cycle < 200)
    {
        jc.SettingRelativeSpeed(HJ_HJ1, -120.0, 0.05);
    }
    else
    {
        cycle = 0;
    }

## XMLで関節を動かす

XMLというマークアップ言語を使って，モーションを作成する．<br>
Think関数の中に「MoveHeadByCode」関数をコメント化して，<br>
「MoveHeadByXML」関数を呼び出すようにする．<br>
ファイルを読み出す部分は

    motion_ = new MotionSequenceXML("xml/MotionXML/ShakingHead.xml");
    
と書いてあるので「RCOpenFUTK/src/xml/MotionXML」に「ShakingHead.xml」をファイル作成する．
「ShakingHead.xml」に以下を追加する

    <sequence name="head_shake" refresh="true">
      <motion name="left" time="100">
        <move id="hj1" degree="120.0" speed="0.05"/>
      </motion>
      <motion name="right" time="100">
        <move id="hj1" degree="-120.0" speed="0.05"/>
      </motion>
    </sequence>
    
 timeは「50」で「1秒」である．<br>
 よって，「2秒間」頭を左に120度に向かせたあと，「2秒間」頭を右に120度向かせるという命令である．<br>
「motion」や「degree」などは「StandUpFromBack.xml」や「StandUpFromProne.xml」を参考にすること．

また「AgentTest.cpp」に戻り「MoveHeadByXML」関数に以下のコードを追加する．

    motion_->Run();
    if(motion_->IsEnd())
    {
         motion_->Reset();
    }
    
これは，先程の想定解とほぼ一緒である．<br>
関数を説明すると

Run関数は，XMLで記述した通りに実行する．<br>
IsEnd関数は，動作が終了しているかどうか，処理が終了したならばtrueが返ってくる．<br>
Reset関数は，動作を初期の状態に戻す．

もし，IsEnd関数がtrueが返された時にReset関数が実行されなければRun関数は実行されない．<br>
したがって，もう一回同じ動作をさせたい場合はReset関数を実行する必要がある．

### 課題 2

「ShakingHead.xml」を編集して，1.5秒間，頭を下に40度動かしたあと，
1.5秒間，頭を上に40度動かすようにせよ．<br>
頭を上下に動かすidは「hj2」である．<br>
「MoveHeadByXML」関数の編集はしなくてもよい．

-想定解-

    <sequence name="test" refresh="true">
      <motion name="down" time="75">
        <move id="hj2" degree="-40.0" speed="0.05"/>
      </motion>
      <motion name="up" time="75">
        <move id="hj2" degree="40.0" speed="0.05"/>
      </motion>
    </sequence>

## 歩行の制御方法

main関数の中身を編集し，「AgentTest」を呼び出すようにする．






