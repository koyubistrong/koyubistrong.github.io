# ロボカップ3D秋キャンプ講習会

### https://koyubistrong.github.io/ にアクセス

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
cycleが0-120の時は右に，cycleが121-240の左に240を超えた時はcycleを0にリセットする．<br>
というような感じで書く．

-想定解-

        JointController& jc = SJointController::GetInstance();
	cycle++;
	if(cycle < 120)
	{
		jc.SettingRelativeSpeed(HJ_HJ1, 120.0, 0.05);
	}
	else if(cycle < 240)
	{
		jc.SettingRelativeSpeed(HJ_HJ1, -120.0, 0.05);
	}
	else
	{
		cycle = 0;
	}
