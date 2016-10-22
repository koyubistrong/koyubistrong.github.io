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
確認したら「make」を実行してコンパイルする．

## 関節を動かす

### コードで直接間接を動かす

Think()の中に「MoveHeadByCode」関数を呼び出すようにする．<br>
「MoveHeadByCode」関数を以下のコードを追加する．
...
  JointController& jc = SJointController::GetInstance();
  jc.SettingRelativeSpeed(HJ_HJ1, 120.0, 0.05);
...

