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

$./AutoMakeFileAM# ロボカップ3D秋キャンプ講習会

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

main関数の中身を編集し，「AgentSample」を呼び出すようにする．<br>
「Strategy/StrategySample」の「StrategySample.cpp」を開く．<br>
Run関数に以下のコードがある．

    walk_->SettingSpeed(1.0, 0.0, 0.0);

このSettingSpeed関数について説明する．

第一引数は前後の速度であり，正の数であれば前進，負の数えあれば後進する．<br>
第二引数は横の速度であり，正の数であれば左に動き，負の数であれば，右に動く．<br>
第三引数は回転の速度であり，正の数であれば左に回転し，負の数であれば，右に回転する．<br>
数値の範囲は全て-1.0から1.0までである．

このコードの場合は全速力で前進に進むことになっている．

## 情報取得方法

情報取得のクラスは「RCOpenFUTK」の「README」のシングルトンクラスの項目に書いてある．<br>
シングルトンはどのクラスからでも情報の取得が可能なクラスである．

AgentStateクラスから情報を取得する場合

    AgentState& as = SAgentState::GetInstance();
    // 自身の位置座標を取得する
    Vector3d my_pos = as.GetCoordinates();
    
WorldStateクラスから情報を取得する場合

    WorldState& ws = SWorldState::GetInstance();
    // ゲームのタイムを取得する
    double game_time = ws.GetGameTime();

FieldStateクラスからボールや敵エージェントの情報を取得する場合

    FieldState& fs = SFieldState::GetInstance();
    const Ball& ball = fs.GetBall();
    const OtherPlayer& op = fs.GetEnemyPlayer(1)
    // ボールの座標を取得する
    Vector3d ball_pos = ball.GetAbsoluteCoordinates();
    // 背番号2番のプレイヤーの座標を取得する
    Vector3d enemy_pos = op.GetAbsoluteCoordinates();
    
このように「（クラス名）& obj = S(クラス名）::GetInstance()」というように取得してから<br>
取りたい情報を取得する．

## ボールに向かわせる

「StrategyInformation」の中の「GetBallDirectionDiff」関数で取得できる．<br>
例えばボールを向かわせるにはこのような感じで「StrategySample.cpp」のRun関数に書く．

    StrategyInformation& si = SStrategyInformation::GetInstance();
    double rotation = si.GetBallDirectionDiff() / 180.0;
    walk_->SettingSpeed(1.0, 0.0, rotation);

しかしながら，回転の速度も十分ではない．<br>
また，前進の速度も早すぎている．<br>
そこでまず回転の速度を上げるようにする

    double rotation = si.GetBallDirectionDiff() / 45.0;
    // ある一定の範囲内に収める関数である．
    // 第二引数は最小値で第三引数は最大値である．
    rotation = Tool::LimitParam(rotation, -1.0, 1.0);

回転速度が大きい時に前進の速度を減らすことについては課題を与える．

### 課題 3

rotation変数の絶対値が大きい時に前進の速度を減らすようにせよ．<br>
なお，実数の絶対値を算出する関数は「fabs」関数である．

-想定解-

     double rotation = si.GetBallDirectionDiff() / 45.0;
     rotation = Tool::LimitParam(rotation, -1.0, 1.0);
     double speed_reduce = fabs(rotation) * 0.8;
     walk_->SettingSpeed(1.0 - speed_reduce, 0.0, rotation);

## 目標の場所に移動する

目標座標に移動させるにはこのようにかく．

    StrategyInformation& si = SStrategyInformation::GetInstance();
    Vector2d target_pos(5.0, 10.0);
    double target_dir = si.CalcDirectionDiff(target_pos);
    double rotation = target_dir / 45.0;
    rotation = Tool::LimitParam(rotation, -1.0, 1.0);
    walk_->SettingSpeed(1.0, 0.0, rotation);

CalcDirectionDiff関数の引数に目標座標を入れれば目標の方向まで後どれくらいの回せばいいのかが出る．
つまり，引数にボールの座標をいれればGetBallDirectionDiff関数と一緒になる．
しかしこれも，行ったり来たりと繰り返してしまう．

## 練習試合

前半　FUT-K　4　-　0　AIT_Soccer3D<br>
後半　FUT-K　4　-　0　AIT_Soccer3D<br>
　　　FUT-K　8　-　0　AIT_Soccer3D<br>


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

main関数の中身を編集し，「AgentSample」を呼び出すようにする．<br>
「Strategy/StrategySample」の「StrategySample.cpp」を開く．<br>
Run関数に以下のコードがある．

    walk_->SettingSpeed(1.0, 0.0, 0.0);

このSettingSpeed関数について説明する．

第一引数は前後の速度であり，正の数であれば前進，負の数えあれば後進する．<br>
第二引数は横の速度であり，正の数であれば左に動き，負の数であれば，右に動く．<br>
第三引数は回転の速度であり，正の数であれば左に回転し，負の数であれば，右に回転する．<br>
数値の範囲は全て-1.0から1.0までである．

このコードの場合は全速力で前進に進むことになっている．

## 情報取得方法

情報取得のクラスは「RCOpenFUTK」の「README」のシングルトンクラスの項目に書いてある．<br>
シングルトンはどのクラスからでも情報の取得が可能なクラスである．

AgentStateクラスから情報を取得する場合

    AgentState& as = SAgentState::GetInstance();
    // 自身の位置座標を取得する
    Vector3d my_pos = as.GetCoordinates();
    
WorldStateクラスから情報を取得する場合

    WorldState& ws = SWorldState::GetInstance();
    // ゲームのタイムを取得する
    double game_time = ws.GetGameTime();

FieldStateクラスからボールや敵エージェントの情報を取得する場合

    FieldState& fs = SFieldState::GetInstance();
    const Ball& ball = fs.GetBall();
    const OtherPlayer& op = fs.GetEnemyPlayer(1)
    // ボールの座標を取得する
    Vector3d ball_pos = ball.GetAbsoluteCoordinates();
    // 背番号2番のプレイヤーの座標を取得する
    Vector3d enemy_pos = op.GetAbsoluteCoordinates();
    
このように「（クラス名）& obj = S(クラス名）::GetInstance()」というように取得してから<br>
取りたい情報を取得する．

## ボールに向かわせる

「StrategyInformation」の中の「GetBallDirectionDiff」関数で取得できる．<br>
例えばボールを向かわせるにはこのような感じで「StrategySample.cpp」のRun関数に書く．

    StrategyInformation& si = SStrategyInformation::GetInstance();
    double rotation = si.GetBallDirectionDiff() / 180.0;
    walk_->SettingSpeed(1.0, 0.0, rotation);

しかしながら，回転の速度も十分ではない．<br>
また，前進の速度も早すぎている．<br>
そこでまず回転の速度を上げるようにする

    double rotation = si.GetBallDirectionDiff() / 45.0;
    // ある一定の範囲内に収める関数である．
    // 第二引数は最小値で第三引数は最大値である．
    rotation = Tool::LimitParam(rotation, -1.0, 1.0);

回転速度が大きい時に前進の速度を減らすことについては課題を与える．

### 課題 3

rotation変数の絶対値が大きい時に前進の速度を減らすようにせよ．<br>
なお，実数の絶対値を算出する関数は「fabs」関数である．

-想定解-

     double rotation = si.GetBallDirectionDiff() / 45.0;
     rotation = Tool::LimitParam(rotation, -1.0, 1.0);
     double speed_reduce = fabs(rotation) * 0.8;
     walk_->SettingSpeed(1.0 - speed_reduce, 0.0, rotation);

## 目標の場所に移動する

目標座標に移動させるにはこのようにかく．

    StrategyInformation& si = SStrategyInformation::GetInstance();
    Vector2d target_pos(5.0, 10.0);
    double target_dir = si.CalcDirectionDiff(target_pos);
    double rotation = target_dir / 45.0;
    rotation = Tool::LimitParam(rotation, -1.0, 1.0);
    walk_->SettingSpeed(1.0, 0.0, rotation);

CalcDirectionDiff関数の引数に目標座標を入れれば目標の方向まで後どれくらいの回せばいいのかが出る．
つまり，引数にボールの座標をいれればGetBallDirectionDiff関数と一緒になる．
しかしこれも，行ったり来たりと繰り返してしまう．

## 練習試合

前半　FUT-K　4　-　0　AIT_Soccer3D<br>
後半　FUT-K　4　-　0　AIT_Soccer3D<br>
　　　FUT-K　8　-　0　AIT_Soccer3D<br>
