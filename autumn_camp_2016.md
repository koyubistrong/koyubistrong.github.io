# ロボカップ3D秋キャンプ講習会

### https://koyubistrong.github.io/ にアクセス

## 関節を動かす

### ファイルの作成

「RCOpenFUTK/src/Agent」に「AgentTest」を作成する
「AgentTest」の中にAgentTest.hppとAgentTest.cppを作成する

### クラスの作成

「AgentTest.hpp」の中に以下を追加する

#ifndef _FUTK_AGENT_TEST_HPP_
#define _FUTK_AGENT_TEST_HPP_

#include "Agent.hpp"
#include "MotionSequence.hpp"

namespace futk
{
	class AgentTest : public Agent
	{
	public:
		AgentTest(int argc, char* argv[]);
		virtual ~AgentTest();

	protected:
		virtual void Think() override;
		void MoveHeadByCode();
		void MoveHeadByXML();
		MotionSequence* motion_;
		int cycle;
	};
}

#endif
